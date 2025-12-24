// src/database/dto/device-binding.dto.ts

import { IsString } from "class-validator";

export class DeviceBindingDto {
  @IsString()
  readonly employeeId: string;
  @IsString()
  readonly deviceUuid: string;
  @IsString()
  readonly deviceType: string; // 例如: 'iOS', 'Android'
}