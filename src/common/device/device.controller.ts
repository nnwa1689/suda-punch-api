// src/device/device.controller.ts
import { Controller, Post, Body, HttpCode, HttpStatus, Delete, UseGuards, Req, BadRequestException, ForbiddenException } from '@nestjs/common';
import { DeviceService } from './device.service';
import { DeviceBindingDto } from '../../database/dto/device-binding.dto';
import { StandardResponse } from '../../common/response.interface';
import { AuthGuard } from '@nestjs/passport';

@Controller('api/v1/device')
export class DeviceController {
  constructor(private readonly deviceService: DeviceService) {}

  @UseGuards(AuthGuard('jwt'))
  @Post('bind')
  @HttpCode(HttpStatus.CREATED) // 創建資源成功，返回 201
  async bindDevice(@Req() req: any, @Body() dto: DeviceBindingDto): Promise<StandardResponse<any>> {
    // 只能為登入中的員工本人綁定裝置
    const employeeId = this.getSelfEmployeeId(req);
    if (dto.employeeId !== undefined && dto.employeeId !== employeeId) {
      throw new ForbiddenException('不可為其他員工綁定裝置。');
    }

    const result = await this.deviceService.bindDevice(employeeId, dto);

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

  @UseGuards(AuthGuard('jwt'))
  @Delete('unbind') // 使用 DELETE 方法
  @HttpCode(HttpStatus.OK) // 執行成功，返回 200
  async unbindDevice(@Req() req: any, @Body() dto: DeviceBindingDto): Promise<StandardResponse<any>> {
    // 管理員可解除任一員工的裝置 (後台重設打卡裝置)；一般員工僅能解除自己的裝置
    let employeeId: string;
    if (req.user.isAdmin && dto.employeeId) {
      employeeId = dto.employeeId;
    } else {
      employeeId = this.getSelfEmployeeId(req);
      if (dto.employeeId !== undefined && dto.employeeId !== employeeId) {
        throw new ForbiddenException('不可解除其他員工的裝置綁定。');
      }
    }

    const result = await this.deviceService.unbindDevice(employeeId, dto.deviceUuid);

    // 返回成功響應
    return {
        statusCode: HttpStatus.OK,
        success: true,
        message: '裝置已成功解除綁定/禁用。',
        data: {
            employeeId: result.employee_id,
            deviceUuid: result.device_uuid,
            isActive: result.is_active, // 應為 false
        }
    };
  }

  /**
   * 取得 JWT 中登入員工的編號
   * @param req 
   * @returns 
   */
  private getSelfEmployeeId(req: any): string {
    const employeeId = req.user?.employeeId;
    if (!employeeId) {
      throw new BadRequestException('當前帳號未連結有效的員工資料');
    }
    return employeeId;
  }
}
