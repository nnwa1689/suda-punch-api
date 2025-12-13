// src/device/device.controller.ts
import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { DeviceService } from './device.service';
import { DeviceBindingDto } from '../../database/dto/device-binding.dto';
import { StandardResponse } from '../../common/response.interface';

@Controller('api/v1/device')
export class DeviceController {
  constructor(private readonly deviceService: DeviceService) {}

  @Post('bind')
  @HttpCode(HttpStatus.CREATED) // 創建資源成功，返回 201
  async bindDevice(@Body() dto: DeviceBindingDto): Promise<StandardResponse<any>> {
    
    const result = await this.deviceService.bindDevice(dto);

    // 返回成功響應，Interceptor 會自動將其包裝
    return {
        statusCode: HttpStatus.CREATED,
        success: true,
        message: '裝置綁定成功。',
        data: {
            employeeId: result.employee_id,
            deviceUuid: result.device_uuid,
            bindingId: result.id,
            isActive: result.is_active,
        }
    };
  }
}