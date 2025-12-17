// src/user/user.controller.ts
import { Controller, Post, Body, ValidationPipe, UsePipes } from '@nestjs/common';
import { UserService } from './user.service';
import { RegisterUserDto } from '../database/dto/register-user.dto';

@Controller('api/v1/users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('register')
  @UsePipes(new ValidationPipe()) // 啟用自動欄位驗證
  async register(@Body() registerUserDto: RegisterUserDto) {
    const user = await this.userService.create(
        registerUserDto.username, 
        registerUserDto.password, 
        registerUserDto.employeeId);
    
    // 安全起見，返回結果中不包含密碼
    return {
      message: '帳號成功建立',
      userId: user.id,
      username: user.username,
    };
  }
}