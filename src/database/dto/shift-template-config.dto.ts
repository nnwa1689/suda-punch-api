// src/database/dto/shift-template-config.dto.ts

export class CreateShiftTemplateDto {
  readonly name: string;
  readonly isCrossDay: boolean; // is_cross_day
  readonly startTimeH: number; // start_time_h
  readonly startTimeM: number; // start_time_m
  readonly endTimeH: number; // end_time_h
  readonly endTimeM: number; // end_time_m
}