import { IsString, IsNumber, IsBoolean, IsOptional, IsEnum, IsArray } from 'class-validator';
import { PunchVerifyType } from '../entities/punch-point.entity';

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
}