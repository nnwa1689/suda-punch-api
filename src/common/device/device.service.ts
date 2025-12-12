import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EmployeeDevice } from '../../database/entities/employee-device.entity';
@Injectable()
export class DeviceService {
constructor(
    @InjectRepository(EmployeeDevice)
    private deviceRepository: Repository<EmployeeDevice>,
  ) {}

  /**
   * 驗證裝置是否已綁定且處於啟用狀態
   * @param employeeId 員工 ID
   * @param deviceUuid 裝置唯一識別碼
   * @returns boolean
   */
  async validateDeviceBinding(employeeId: string, deviceUuid: string): Promise<boolean> {
    const device = await this.deviceRepository.findOne({
      where: {
        employee_id: employeeId,
        device_uuid: deviceUuid,
        is_active: true, // 必須是啟用中的裝置
      },
    });

    return !!device; // 找到裝置則返回 true
  }
}
