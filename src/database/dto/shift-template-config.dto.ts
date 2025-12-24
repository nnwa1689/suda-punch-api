// src/database/dto/shift-template-config.dto.ts
import { IsString, IsBoolean, IsInt, Min, Max, IsOptional } from 'class-validator';

export class CreateShiftTemplateDto {
  @IsString()
  readonly id: string;
  @IsString()
  readonly name: string;
  
  @IsBoolean()
  @IsOptional()
  readonly isCrossDay: boolean; // 映射到 is_cross_day

  @IsInt()
  @Min(0)
  @Max(23)
  readonly startTimeH: number; // 映射到 start_time_h

  @IsInt()
  @Min(0)
  @Max(59)
  readonly startTimeM: number; // 映射到 start_time_m

  @IsInt()
  @Min(0)
  @Max(23)
  readonly endTimeH: number; // 映射到 end_time_h

  @IsInt()
  @Min(0)
  @Max(59)
  readonly endTimeM: number; // 映射到 end_time_m

  @IsBoolean()
  @IsOptional()
  readonly isActive:boolean;
}