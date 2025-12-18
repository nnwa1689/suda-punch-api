// src/punch/dto/hr-query-punch.dto.ts
import { Type } from 'class-transformer';
import { IsOptional, IsString, IsDateString, IsInt, Min } from 'class-validator';

export class HrQueryPunchDto {
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsString()
  employeeId?: string;

  @IsOptional()
  @IsString()
  departmentId?: string; // 如果您的 Employee 實體有部門欄位
  
  // 分頁參數
  @IsOptional()
  @Type(() => Number) // 確保字串轉為數字
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 10;
}