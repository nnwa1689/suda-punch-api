// src/database/dto/employee-schedule-config.dto.ts

export class CreateEmployeeScheduleDto {
  readonly employeeId: string; // 員工 UUID
  readonly scheduleDate: Date; // 排班的日期
  readonly shiftTemplateId: string; // 班別模板 UUID
}