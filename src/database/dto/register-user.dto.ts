// src/user/dto/register-user.dto.ts
import { IsString, IsNotEmpty, MinLength, IsUUID } from 'class-validator';

export class RegisterUserDto {
  @IsString()
  @IsNotEmpty()
  username: string;

  @IsString()
  @MinLength(6, { message: '密碼長度至少需要 6 個字元' })
  password: string;

  @IsString()
  @IsNotEmpty()
  employeeId: string; // 關聯的員工 ID
}