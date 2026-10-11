// src/punch/punch.service.ts
import { Injectable, ForbiddenException, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { v4 as uuid_v4 } from 'uuid';
import { PunchLog } from '../../database/entities/punch-log.entity';
import { PunchPoint, PunchVerifyType } from '../../database/entities/punch-point.entity';
import { DeviceService } from '../../common/device/device.service';
import { GeoService } from '../../common/geo/geo.service';
import { EmployeeScheduleService } from 'src/employee/employee-schedule/employee-schedule.service';
import { HrQueryPunchDto } from 'src/database/dto/hr-query-punch.dto';
import { MyPunchQueryDto } from 'src/database/dto/my-punch-query.dto';
import { EmployeeSchedule } from 'src/database/entities/employee-schedule.entity';
import { Employee } from 'src/database/entities/employee.entity';
import { CreatePunchRecordDto, UpdatePunchRecordDto } from 'src/database/dto/punch-record.dto';
import { HolidayService } from 'src/holiday/holiday.service';
import moment from 'moment';

@Injectable()
export class PunchService {
  // 注入所需的 Repository 和 Service
  constructor(
    @InjectRepository(PunchLog)
    private logsRepository: Repository<PunchLog>,
    @InjectRepository(PunchPoint)
    private pointsRepository: Repository<PunchPoint>,
    @InjectRepository(Employee)
    private employeeRepository: Repository<Employee>,
    private deviceService: DeviceService,
    private geoService: GeoService,
    private readonly scheduleService: EmployeeScheduleService,
    private readonly holidayService: HolidayService,
  ) {}

  /**
   * 處理員工打卡請求的核心業務邏輯
   * @param employeeId 
   * @param deviceUuid 
   * @param lat 
   * @param lng 
   * @returns 
   */
  async submitPunch(employeeId: string, deviceUuid: string, lat: number, lng: number, type: string, punch_points_id: string, currentSsid?: string, currentBssid?: string): Promise<PunchLog> {
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

    if (punchPoint.verify_type === PunchVerifyType.WIFI) {
      if (!currentSsid || !currentBssid) {
        throw new BadRequestException('此地點要求開啟 WiFi 驗證，但未偵測到 WIFI 資訊');
      }
      // 進行 SSID 比對 (忽略大小寫或精確比對)
      const normalizedBssid = currentBssid.toLowerCase();
      const bssidWhitelist = (punchPoint.wifi_bssid_list || []).map(b => b.toLowerCase());
      const isSsidValid = punchPoint.wifi_ssid?.toLowerCase() === currentSsid?.toLowerCase() && bssidWhitelist.includes(normalizedBssid);
      
      if (!isSsidValid) {
        throw new BadRequestException(`WiFi 驗證失敗，非指定的 WiFi 設備。`);
      }
    } else if (punchPoint.verify_type === PunchVerifyType.GPS) {
      const distance:number = this.geoService.calculateDistance(
          { latitude: lat, longitude: lng }, // 員工當前位置
          { latitude: punchPoint.latitude, longitude: punchPoint.longitude } // 允許打卡點中心
        );

      const isValidGps:boolean = distance <= punchPoint.radius_meters;
      if (!isValidGps) {
        throw new ForbiddenException(`打卡失敗：您距離最近打卡點 ${distance.toFixed(2)} 公尺，超出允許範圍 (${punchPoint.radius_meters}m)。`);
      }
    }

    if (type !== 'CHECK_IN' && type !== 'CHECK_OUT') {
      throw new BadRequestException(`${ type } 不是合法的打卡類別。`);
    }
    const status = await this.resolvePunchStatus(employeeId, type, punchTime);
    const isLate = status.isLate;
    const isEarly = status.isEarly;
    resultMessage = status.remark ?? '';

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
    .leftJoinAndSelect('employee.department', 'department')
    .leftJoinAndSelect('punch.punchPoint', 'punchPoint')
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
   * 後台-新增打卡紀錄 (補登)
   * @param dto 
   * @returns 
   */
  async createPunchRecord(dto: CreatePunchRecordDto): Promise<PunchLog> {
    await this.ensureEmployeeExists(dto.employeeId);
    const punchPoint = await this.findPunchPointOrFail(dto.punchPointsId);
    const punchTime = new Date(dto.punchTime);
    const status = await this.resolvePunchStatus(dto.employeeId, dto.punchType, punchTime);

    const log = this.logsRepository.create({
      id: uuid_v4(),
      employee_id: dto.employeeId,
      punch_time: punchTime,
      recorded_lat: dto.recordedLat ?? punchPoint.latitude,
      recorded_lng: dto.recordedLng ?? punchPoint.longitude,
      punch_points_id: punchPoint.id,
      punch_type: dto.punchType,
      is_late: dto.isLate ?? status.isLate,
      is_early: dto.isEarly ?? status.isEarly,
      remark: dto.remark ?? status.remark ?? '',
    });

    await this.logsRepository.save(log);
    return this.findPunchRecordOrFail(log.id);
  }

  /**
   * 後台-更新打卡紀錄
   * 若變更員工、時間或類別且未指定遲到/早退，則依排班重新計算
   * @param id 
   * @param dto 
   * @returns 
   */
  async updatePunchRecord(id: string, dto: UpdatePunchRecordDto): Promise<PunchLog> {
    const log = await this.findPunchRecordOrFail(id);

    if (dto.employeeId !== undefined) {
      await this.ensureEmployeeExists(dto.employeeId);
      log.employee_id = dto.employeeId;
    }
    if (dto.punchPointsId !== undefined) {
      const punchPoint = await this.findPunchPointOrFail(dto.punchPointsId);
      log.punch_points_id = punchPoint.id;
    }
    if (dto.punchTime !== undefined) log.punch_time = new Date(dto.punchTime);
    if (dto.punchType !== undefined) log.punch_type = dto.punchType;
    if (dto.recordedLat !== undefined) log.recorded_lat = dto.recordedLat;
    if (dto.recordedLng !== undefined) log.recorded_lng = dto.recordedLng;
    if (dto.remark !== undefined) log.remark = dto.remark;

    const needRecalc = dto.employeeId !== undefined || dto.punchTime !== undefined || dto.punchType !== undefined;
    if (needRecalc && (dto.isLate === undefined || dto.isEarly === undefined)) {
      const status = await this.resolvePunchStatus(log.employee_id, log.punch_type ?? '', new Date(log.punch_time));
      log.is_late = status.isLate;
      log.is_early = status.isEarly;
    }
    if (dto.isLate !== undefined) log.is_late = dto.isLate;
    if (dto.isEarly !== undefined) log.is_early = dto.isEarly;

    await this.logsRepository.update(id, {
      employee_id: log.employee_id,
      punch_time: log.punch_time,
      punch_points_id: log.punch_points_id,
      punch_type: log.punch_type,
      recorded_lat: log.recorded_lat,
      recorded_lng: log.recorded_lng,
      is_late: log.is_late,
      is_early: log.is_early,
      remark: log.remark,
    });
    return this.findPunchRecordOrFail(id);
  }

  /**
   * 後台-刪除打卡紀錄 (實際刪除)
   * @param id 
   */
  async deletePunchRecord(id: string): Promise<void> {
    const result = await this.logsRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`找不到 ID 為 ${id} 的打卡紀錄，刪除失敗。`);
    }
  }

  private async findPunchRecordOrFail(id: string): Promise<PunchLog> {
    const log = await this.logsRepository.findOne({
      where: { id },
      relations: ['employee', 'punchPoint'],
    });
    if (!log) {
      throw new NotFoundException(`找不到 ID 為 ${id} 的打卡紀錄。`);
    }
    return log;
  }

  private async ensureEmployeeExists(employeeId: string): Promise<void> {
    const employee = await this.employeeRepository.findOne({ where: { id: employeeId } });
    if (!employee) {
      throw new NotFoundException(`找不到員工編號 ${employeeId}。`);
    }
  }

  // 後台調整允許使用已停用的打卡點 (修正歷史紀錄)
  private async findPunchPointOrFail(punchPointsId: string): Promise<PunchPoint> {
    const punchPoint = await this.pointsRepository.findOne({ where: { id: punchPointsId } });
    if (!punchPoint) {
      throw new NotFoundException(`找不到打卡點 ${punchPointsId}。`);
    }
    return punchPoint;
  }

  /**
   * 依例假日與排班判斷遲到/早退
   * 例假日不計遲到早退 (與 App 今日班別顯示「無排班(例假日)」一致)
   * @returns remark 為需要寫入打卡紀錄的系統備註，無則為 undefined
   */
  private async resolvePunchStatus(employeeId: string, type: string, punchTime: Date): Promise<{ isLate: boolean; isEarly: boolean; remark?: string }> {
    const holiday = await this.holidayService.getHolidayWithDate(moment(punchTime).format('YYYY-MM-DD'));
    if (holiday) {
      return { isLate: false, isEarly: false, remark: `例假日(${holiday.subject})打卡，不計遲到早退。` };
    }

    const schedule = await this.getEmployeeSchedule(employeeId, punchTime);
    if (!schedule) {
      return { isLate: false, isEarly: false, remark: '無排班記錄，請確認是否異常打卡。' };
    }
    return {
      isLate: type === 'CHECK_IN' ? this.calculateLateStatus(schedule, punchTime) : false,
      isEarly: type === 'CHECK_OUT' ? this.calculateEarlyStatus(schedule, punchTime) : false,
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