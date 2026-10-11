// src/database/dto/device-binding.dto.ts

import { IsOptional, IsString } from "class-validator";

export class DeviceBindingDto {
  // 綁定對象一律取自 JWT；此欄位僅供相容既有用戶端，與登入員工不符時拒絕 (管理員解除綁定時可指定)
  @IsOptional()
  @IsString()
  readonly employeeId?: string;
  @IsString()
  readonly deviceUuid: string;
  @IsString()
  readonly deviceType: string; // 例如: 'iOS', 'Android'
}
