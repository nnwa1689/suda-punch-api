// src/database/dto/device-binding.dto.ts

export class DeviceBindingDto {
  readonly employeeId: string;
  readonly deviceUuid: string;
  readonly deviceType: string; // 例如: 'iOS', 'Android'
}