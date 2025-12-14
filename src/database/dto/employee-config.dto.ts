// src/database/dto/employee-config.dto.ts

export class CreateEmployeeDto {
  readonly id: string;
  readonly name: string;
  readonly isActive: boolean;
  readonly departmentId: string;
}