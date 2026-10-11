import { IsString, IsNumber, IsBoolean, IsOptional, IsEnum, IsArray, Matches } from 'class-validator';
import { PunchVerifyType } from '../entities/punch-point.entity';

// iOS 以 CBUUID(string:) 解析，格式錯誤會造成 App 閃退：僅接受 16-bit、32-bit 或 128-bit UUID (空字串表示清除)
export const BLUETOOTH_UUID_PATTERN =
  /^$|^[0-9A-Fa-f]{4}$|^[0-9A-Fa-f]{8}$|^[0-9A-Fa-f]{8}-[0-9A-Fa-f]{4}-[0-9A-Fa-f]{4}-[0-9A-Fa-f]{4}-[0-9A-Fa-f]{12}$/;

export class CreatePunchPointDto {
  @IsString()
  id: string;

  @IsString()
  name: string;

  @IsNumber()
  latitude: number;

  @IsNumber()
  longitude: number;

  @IsOptional()
  @IsNumber()
  radiusMeters?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsEnum(PunchVerifyType)
  verifyType: PunchVerifyType;

  // 2. WiFi 相關欄位
  @IsOptional()
  @IsString()
  wifiSsid?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true }) // 確保陣列內每個元素都是字串
  wifiBssidList?: string[];

  // 3. 藍牙相關欄位 (verifyType 為 Bluetooth 時必填)
  @IsOptional()
  @IsString()
  @Matches(BLUETOOTH_UUID_PATTERN, { message: '藍牙 Service UUID 格式錯誤，需為 4 碼、8 碼或標準 UUID (例如 180D 或 xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx)' })
  bluetoothServiceUuid?: string;
}
