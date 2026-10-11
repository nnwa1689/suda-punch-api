// src/database/dto/punch-record.dto.ts
// 後台打卡紀錄調整 (新增 / 更新) 用 DTO，欄位對應 punch_logs
import { PartialType } from '@nestjs/swagger';
import { IsBoolean, IsDateString, IsIn, IsNotEmpty, IsNumber, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreatePunchRecordDto {
  @IsString()
  @IsNotEmpty({ message: '員工編號不可為空' })
  readonly employeeId: string; // employee_id

  @IsDateString()
  readonly punchTime: string; // punch_time (ISO 8601，含時區)

  @IsString()
  @IsNotEmpty({ message: '打卡點不可為空' })
  readonly punchPointsId: string; // punch_points_id

  @IsString()
  @IsIn(['CHECK_IN', 'CHECK_OUT'], { message: '打卡類別必須為 CHECK_IN 或 CHECK_OUT' })
  readonly punchType: string; // punch_type

  // 未提供時以打卡點中心座標代入
  @IsOptional()
  @IsNumber()
  readonly recordedLat?: number; // recorded_lat

  @IsOptional()
  @IsNumber()
  readonly recordedLng?: number; // recorded_lng

  // 未提供時依排班自動計算
  @IsOptional()
  @IsBoolean()
  readonly isLate?: boolean; // is_late

  @IsOptional()
  @IsBoolean()
  readonly isEarly?: boolean; // is_early

  @IsOptional()
  @IsString()
  @MaxLength(100, { message: '備註最多 100 字' })
  readonly remark?: string; // remark
}

export class UpdatePunchRecordDto extends PartialType(CreatePunchRecordDto) {}
