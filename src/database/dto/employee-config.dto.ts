// src/database/dto/employee-config.dto.ts
import { Type } from 'class-transformer';
import { IsOptional, IsDate, IsDateString } from 'class-validator';

export class CreateEmployeeDto {
  readonly id: string;
  readonly name: string;
  readonly isActive: boolean;
  @IsOptional()
  @IsDateString()
  arrival?: string;
  readonly departmentId: string;
}