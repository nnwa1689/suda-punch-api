import { IsString, IsNumber, IsBoolean, IsOptional } from 'class-validator';

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
}