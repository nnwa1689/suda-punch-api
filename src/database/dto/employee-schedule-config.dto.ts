// src/database/dto/employee-schedule-config.dto.ts
import { IsDateString, IsIn, IsString } from "class-validator";

export class CreateEmployeeScheduleDto {
  @IsString()
  readonly employeeId: string; // 員工 UUID
  @IsDateString()
  readonly scheduleDate: Date; // 排班的日期
  @IsString()
  readonly shiftTemplateId: string; // 班別模板 UUID
  @IsString()
  @IsIn(['fixed', 'daily'], { message: '排班類型必須為 fixed (循環) 或 daily (每日)' })
  readonly scheduleType: string; //fixed (循環) 與 daily (每日排班)。
}