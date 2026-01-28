// src/departments/dto/create-department.dto.ts
import { IsString, IsNotEmpty } from 'class-validator';

export class UpdateSudaBaseDto {
  @IsString()
  @IsNotEmpty()
  base_value: string;
}