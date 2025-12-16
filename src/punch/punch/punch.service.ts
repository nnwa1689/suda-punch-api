// src/punch/punch.service.ts
import { Injectable, ForbiddenException, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { v4 as uuid_v4 } from 'uuid';
import { PunchLog } from '../../database/entities/punch-log.entity';
import { PunchPoint } from '../../database/entities/punch-point.entity';
import { DeviceService } from '../../common/device/device.service';
import { GeoService } from '../../common/geo/geo.service';
import { EmployeeScheduleService } from 'src/employee/employee-schedule/employee-schedule.service';

@Injectable()
export class PunchService {
  // 注入所需的 Repository 和 Service
  constructor(
    @InjectRepository(PunchLog)
    private logsRepository: Repository<PunchLog>,
    @InjectRepository(PunchPoint)
    private pointsRepository: Repository<PunchPoint>,
    private deviceService: DeviceService,
    private geoService: GeoService,
    private readonly scheduleService: EmployeeScheduleService,
  ) {}

  /**
   * 處理員工打卡請求的核心業務邏輯
   * @param employeeId 
   * @param deviceUuid 
   * @param lat 
   * @param lng 
   * @returns 
   */
  async submitPunch(employeeId: string, deviceUuid: string, lat: number, lng: number, type: string, punch_points_id: string): Promise<PunchLog> {
    // 取得打卡時間
    const punchTime = this.geoService.getSystemTime();

    // 1. **裝置驗證 (Device Validation)**
    const isDeviceValid = await this.deviceService.validateDeviceBinding(employeeId, deviceUuid);
    if (!isDeviceValid) {
      // 裝置未綁定或不是該員工的啟用裝置，拒絕打卡
      throw new ForbiddenException('打卡失敗：裝置未綁定或非授權裝置。');
    }
    
    // --- 由於暫不使用 Redis，我們省略了分散式鎖 ---
    // 2. **GPS 驗證 (Geo-fencing)**
    // 這裡我們示範查找第一個啟用的打卡點作為驗證點
    const punchPoint = await this.pointsRepository.findOne({ 
      where: {  is_active: true, id: punch_points_id } 
    });
    if (!punchPoint) {
      throw new NotFoundException('打卡點規則未設定或未啟用！');
    }

    const distance:number = this.geoService.calculateDistance(
      { latitude: lat, longitude: lng }, // 員工當前位置
      { latitude: punchPoint.latitude, longitude: punchPoint.longitude } // 允許打卡點中心
    );

    const isValidGps:boolean = distance <= punchPoint.radius_meters;
    if (!isValidGps) {
      // 超出範圍，拒絕打卡
      throw new ForbiddenException(`打卡失敗：您距離最近打卡點 ${distance.toFixed(2)} 公尺，超出允許範圍 (${punchPoint.radius_meters}m)。`);
    }

    // 1. 取得當日排班
    const schedule = await this.getEmployeeSchedule(employeeId, punchTime);
    var isLate:boolean = false;
    var isEarly:boolean = false;
    if(type == 'CHECK_IN')
      isLate = this.calculateLateStatus(schedule, punchTime);
    else if(type == 'CHECK_OUT')
      isEarly = this.calculateEarlyStatus(schedule, punchTime);
    else
      throw new BadRequestException(`${ type } 不是合法的打卡類別。`);

    // 3. **記錄寫入 (Transaction)**
    // 在這裡，您可以使用 TypeORM 的 transaction 確保多個資料庫操作的原子性
    const log = this.logsRepository.create({
      id: uuid_v4(),
      employee_id: employeeId,
      punch_time: new Date(),
      recorded_lat: lat,
      recorded_lng: lng,
      punch_points_id: punchPoint.id,
      punch_type: type,
      is_late: isLate,
      is_early: isEarly
    });

    const savedLog = await this.logsRepository.save(log);
    // 4. **（未來）考勤狀態更新**：這裡應該更新日彙總考勤表和快取 (如果 Redis 被啟用)
    return savedLog;
  }

  // [新增] 根據員工和日期，取得排班記錄
  private async getEmployeeSchedule(employeeId: string, date: Date): Promise<any> {
      // 呼叫 EmployeeScheduleService 查找排班
      // 您可能需要在 EmployeeScheduleService 中新增一個 findByEmployeeAndDate 方法
      // 這裡先假設有這個方法
      const schedule = await this.scheduleService.findByEmployeeAndDate(employeeId, date); 

      if (!schedule) {
          // 如果當天沒有排班，可能需要記錄為異常打卡或允許自由打卡
          return null;
      }
      return schedule;
  }

  // [新增] 計算是否遲到
  private calculateLateStatus(schedule: any, punchTime: Date): boolean {
      if (!schedule) {
          return false; // 無排班不判斷遲到
      }

      const template = schedule.template;
      // 1. 取得標準上班時間 (小時和分鐘)
      const scheduledStartH = template.start_time_h;
      const scheduledStartM = template.start_time_m;
      
      // 2. 結合打卡日期與排班時間，建立標準上班時間點 (Date 物件)
      const scheduledStartTime = new Date(punchTime);
      scheduledStartTime.setHours(scheduledStartH, scheduledStartM, 0, 0);
      
      // 3. 比較打卡時間是否晚於標準上班時間
      // 假設打卡時間是 09:05:00，標準時間是 09:00:00
      return punchTime.getTime() > scheduledStartTime.getTime();
  }

  // [新增] 計算是否早退
  private calculateEarlyStatus(schedule: any, punchTime: Date): boolean {
      if (!schedule) {
          return false; // 無排班不判斷遲到
      }

      const template = schedule.template;
      // 1. 取得標準上班時間 (小時和分鐘)
      const scheduledEndH = template.end_time_h;
      const scheduledEndM = template.end_time_m;
      const scheduledEndTime = new Date(punchTime);
      scheduledEndTime.setHours(scheduledEndH, scheduledEndM, 0, 0);

      if (template.is_cross_day) {
          scheduledEndTime.setDate(scheduledEndTime.getDate() + 1); // 日期加一天
      }
      
      // 3. 比較打卡時間是否晚於標準上班時間
      // 假設打卡時間是 09:05:00，標準時間是 09:00:00
      return punchTime.getTime() < scheduledEndTime.getTime();
  }
}