// src/punch/punch.service.ts
import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { v4 as uuid_v4 } from 'uuid';
import { PunchLog } from '../../database/entities/punch-log.entity';
import { PunchPoint } from '../../database/entities/punch-point.entity';
import { DeviceService } from '../../common/device/device.service';
import { GeoService } from '../../common/geo/geo.service';

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
    });

    const savedLog = await this.logsRepository.save(log);

    // 4. **（未來）考勤狀態更新**：這裡應該更新日彙總考勤表和快取 (如果 Redis 被啟用)

    return savedLog;
  }
}