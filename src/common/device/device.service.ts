import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { EmployeeDevice } from '../../database/entities/employee-device.entity';
import { DeviceBindingDto } from '../../database/dto/device-binding.dto';
import { Employee } from 'src/database/entities/employee.entity';

@Injectable()
export class DeviceService {
constructor(
    @InjectRepository(EmployeeDevice)
    private deviceRepository: Repository<EmployeeDevice>,
    @InjectRepository(Employee) // *** 注入 Employee Repository ***
    private employeeRepository: Repository<Employee>,
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

  /**
   * 裝置註冊/綁定邏輯
   */
  async bindDevice(dto: DeviceBindingDto): Promise<EmployeeDevice> {
    const { employeeId, deviceUuid, deviceType } = dto;
    // --- 關鍵驗證：員工是否存在且啟用 ---
    const employee = await this.employeeRepository.findOne({
      where: { 
        id: employeeId,
      }
    });

    if (!employee) {
      throw new NotFoundException(`員工 ID ${employeeId} 不存在。`);
    }

    if (!employee.is_active) {
      // 員工存在但非啟用（例如已離職）
      throw new ForbiddenException(`員工 ID ${employeeId} 已被禁用，無法綁定裝置。`);
    }

    // 1. 嘗試查找現有的綁定記錄 (無論是否啟用)
    let device = await this.deviceRepository.findOne({
      where: {
        employee_id: employeeId,
        device_uuid: deviceUuid,
      },
    });

    if (device) {
      // 2. 設備已綁定：如果它不是啟用狀態，則重新啟用
      if (!device.is_active) {
        device.is_active = true;
        // 由於我們使用了 UNIQUE 索引，這裡只需要保存更新
        return this.deviceRepository.save(device); 
      }
      // 如果已經是啟用狀態，則直接返回現有記錄
      return device;
    } else {
      // 3. 設備未綁定：創建新的綁定記錄
      const newDevice = this.deviceRepository.create({
        id: uuidv4(),
        employee_id: employeeId,
        device_uuid: deviceUuid,
        device_type: deviceType,
        is_active: true,
        created_at: new Date(),
      });
      return this.deviceRepository.save(newDevice);
    }
  }
}
