// src/database/dto/shift-template-config.dto.ts
import { IsString, IsBoolean, IsInt, Min, Max, IsOptional, IsNotEmpty, MaxLength } from 'class-validator';
import { OmitType, PartialType } from '@nestjs/swagger';

export class CreateShiftTemplateDto {
  @IsString()
  @IsNotEmpty({ message: '班別代碼不可為空' })
  @MaxLength(100)
  readonly id: string;
  @IsString()
  @IsNotEmpty({ message: '班別名稱不可為空' })
  @MaxLength(100)
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

// 更新時不可修改班別代碼
export class UpdateShiftTemplateDto extends PartialType(OmitType(CreateShiftTemplateDto, ['id'] as const)) {}
