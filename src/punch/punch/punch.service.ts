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
import { HrQueryPunchDto } from 'src/database/dto/hr-query-punch.dto';
import { MyPunchQueryDto } from 'src/database/dto/my-punch-query.dto';
import { EmployeeSchedule } from 'src/database/entities/employee-schedule.entity';

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
    const punchTime = this.geoService.getSystemTime();
    var resultMessage: string = '';
    
    const isDeviceValid = await this.deviceService.validateDeviceBinding(employeeId, deviceUuid);
    if (!isDeviceValid) {
      throw new ForbiddenException('打卡失敗：裝置未綁定或非授權裝置。');
    } 
    
    // --- 由於暫不使用 Redis，我們省略了分散式鎖 ---
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
      throw new ForbiddenException(`打卡失敗：您距離最近打卡點 ${distance.toFixed(2)} 公尺，超出允許範圍 (${punchPoint.radius_meters}m)。`);
    }

    const schedule = await this.getEmployeeSchedule(employeeId, punchTime);
    if(schedule == null){
      resultMessage = '無排班記錄，請確認是否異常打卡。';
    }
    var isLate:boolean = false;
    var isEarly:boolean = false;
    if(type == 'CHECK_IN')
      isLate = this.calculateLateStatus(schedule, punchTime);
    else if(type == 'CHECK_OUT')
      isEarly = this.calculateEarlyStatus(schedule, punchTime);
    else
      throw new BadRequestException(`${ type } 不是合法的打卡類別。`);

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
      is_early: isEarly,
      remark: resultMessage,
    });

    const savedLog = await this.logsRepository.save(log);
    return savedLog;
  }

  /**
   * 取得特定人員最後一筆打卡紀錄
   * @param employeeId 
   * @returns 
   */
  async getLastPunch(employeeId: string) {
    return await this.logsRepository.findOne({
      relations: ['punchPoint'],
      where: { employee_id: employeeId },
      order: { punch_time: 'DESC' }, // 抓最新的一筆
    });
  }

  /**
   *  後台-條件查詢所有人打卡紀錄
   * @param query 
   * @returns 
   */
  async getAdminPunchRecords(query: HrQueryPunchDto) {
    const { startDate, endDate, employeeId, departmentId, page = 1, limit = 10 } = query;

    // 計算要跳過多少筆紀錄
  const skip = (page - 1) * limit;

  const queryBuilder = this.logsRepository.createQueryBuilder('punch')
    .leftJoinAndSelect('punch.employee', 'employee')
    .orderBy('punch.punch_time', 'DESC')
    .skip(skip)
    .take(limit);

    // 1. 按日期區間篩選
    if (startDate && endDate) {
      queryBuilder.andWhere('punch.punch_time BETWEEN :startDate AND :endDate', { 
        startDate: `${startDate} 00:00:00`, 
        endDate: `${endDate} 23:59:59` 
      });
    }

    // 2. 按特定人員篩選
    if (employeeId) {
      queryBuilder.andWhere('punch.employee_id = :employeeId', { employeeId });
    }

    // 3. 按部門篩選 (假設 employee 實體中有 department_id)
    if (departmentId) {
      queryBuilder.andWhere('employee.department_id = :departmentId', { departmentId });
    }

    return await queryBuilder.getMany();
  }

  /**
   * 取得個人所有的打卡紀錄-JWT TOKEN
   * @param employeeId 
   * @param query 
   * @returns 
   */
  async getMyPunchRecords(employeeId: string, query: MyPunchQueryDto) {
    const { startDate, endDate, page = 1, limit = 10 } = query;
    const skip = (page - 1) * limit;
    const queryBuilder = this.logsRepository.createQueryBuilder('punch')
      .where('punch.employee_id = :employeeId', { employeeId }) // 強制過濾該員工
      .orderBy('punch.punch_time', 'DESC')
      .skip(skip)
      .take(limit);

    if (startDate && endDate) {
      queryBuilder.andWhere('punch.punch_time BETWEEN :startDate AND :endDate', { 
        startDate: `${startDate} 00:00:00`, 
        endDate: `${endDate} 23:59:59` 
      });
    }

    const [data, total] = await queryBuilder.getManyAndCount();
    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  /**
   * 根據員工和日期，取得排班記錄
   * @param employeeId 
   * @param date 
   * @returns 
   */
  private async getEmployeeSchedule(employeeId: string, date: Date): Promise<any> {
      var schedule:EmployeeSchedule | null = await this.scheduleService.findByEmployeeAndDate(employeeId, date); 
      if (!schedule) {
        // 此人是否有固定班別
        schedule = await this.scheduleService.findOneFixedScheduleExistForMonth(employeeId, date);
      }
      return schedule;
  }

  /**
   * 計算是否遲到
   * @param schedule 
   * @param punchTime 
   * @returns 
   */
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

  /**
   * 計算是否早退
   * @param schedule 
   * @param punchTime 
   * @returns 
   */
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