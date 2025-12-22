// src/admin/dto/list-employee-query.dto.ts
import { IsOptional, IsString, IsInt, Min, IsBooleanString } from 'class-validator';
import { Type } from 'class-transformer';

export class ListEmployeeQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 10;

  @IsOptional()
  @IsString()
  name?: string; // 搜尋姓名

  @IsOptional()
  @IsString()
  departmentId?: string;

  @IsOptional()
  @IsBooleanString()
  isActive?: string; // 'true' 或 'false'
}