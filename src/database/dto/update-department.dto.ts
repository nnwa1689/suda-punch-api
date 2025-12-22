// src/departments/dto/update-department.dto.ts
import { PartialType } from '@nestjs/swagger'; // 之前設定過 Swagger 可使用
import { CreateDepartmentDto } from './create-department.dto';

export class UpdateDepartmentDto extends PartialType(CreateDepartmentDto) {}