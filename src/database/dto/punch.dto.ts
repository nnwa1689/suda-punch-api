// src/database/dto/punch.dto.ts

import { IsNumber, IsString } from "class-validator";

// 雖然這裡只是 class，但建議使用 interface/class 結合 @nestjs/swagger 和 class-validator 
// 來實現資料驗證和 API 文件生成。這裡我們使用簡單的 class。

export class PunchDto {
  //readonly employeeId: string; 
  @IsNumber()
  readonly latitude: number;
  @IsNumber()
  readonly longitude: number;
  @IsString()
  readonly deviceUuid: string;
  @IsString()
  readonly type: string;
  @IsString()
  readonly punchPointsId: string;
}