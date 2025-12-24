// src/database/dto/employee-config.dto.ts
import { Type } from 'class-transformer';
import { IsOptional, IsDateString, IsString, IsBoolean } from 'class-validator';

export class CreateEmployeeDto {
  @IsString()
  readonly id: string;
  @IsString()
  readonly name: string;
  @IsBoolean()
  readonly isActive: boolean;
  @IsOptional()
  @IsDateString()
  arrival?: string;
  readonly departmentId: string;
}