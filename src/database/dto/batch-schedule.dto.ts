// src/database/dto/batch-schedule.dto.ts
import { Type } from 'class-transformer';
import { ArrayMaxSize, ArrayMinSize, IsArray, IsOptional, IsString, Matches, ValidateNested } from 'class-validator';

// 月曆式班表的一列：一位員工一個月的班表
export class BatchScheduleRowDto {
  @IsString()
  readonly departmentId: string; // 部門代碼 (亦可填部門名稱)
  @IsString()
  readonly employeeId: string; // 員工編號

  // 循環班別代碼：有填則建立整月的固定排班 (fixed)
  @IsOptional()
  @IsString()
  readonly cyclicShiftTemplateId?: string;

  // 逐日班別代碼：days[0] 為 1 日，空字串表示當天不排班；每日排班 (daily) 優先於循環班別
  @IsArray()
  @ArrayMaxSize(31, { message: '每日班別最多 31 天' })
  @IsString({ each: true })
  readonly days: string[];
}

export class BatchScheduleDto {
  // 匯入月份
  @IsString()
  @Matches(/^\d{4}-(0[1-9]|1[0-2])$/, { message: '匯入月份格式必須為 YYYY-MM' })
  readonly month: string;

  @IsArray()
  @ArrayMinSize(1, { message: '匯入資料不可為空' })
  @ArrayMaxSize(2000, { message: '單次匯入最多 2000 位員工' })
  @ValidateNested({ each: true })
  @Type(() => BatchScheduleRowDto)
  readonly rows: BatchScheduleRowDto[];
}
