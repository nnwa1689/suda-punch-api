// src/user/user.controller.ts
import { Controller, Post, Body, ValidationPipe, UsePipes, Get, UseGuards, Query, Param, Req } from '@nestjs/common';
import { UserService } from './user.service';
import { RegisterUserDto } from '../database/dto/register-user.dto';
import { AuthGuard } from '@nestjs/passport';
import { AdminGuard } from 'src/auth/admin.guard';

@Controller('api/v1/users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @UseGuards(AuthGuard('jwt'), AdminGuard)
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

  @UseGuards(AuthGuard('jwt'), AdminGuard)
  @Get(':id')
  async getUser(@Param('id') id: string) {
    const user = await this.userService.findByUsername(id);
    
    if (!user) {
      return {
        message: '使用者不存在或未啟用',
        data: null,
      };
    }
    
    return {
      message: '',
      data: {
        userId: user?.id,
        username: user?.username,
        isActive: user?.is_active,
        isAdmin: user?.is_admin,
      }
    };
  }

  /**
   * 取得自己使用者與裝置資訊
   * @param req 
   * @returns 
   */
  @UseGuards(AuthGuard('jwt'))
  @Get('get/self')
  async getSelf(@Req() req: any) {
    const username = req.user.username;
    const user = await this.userService.findByUsername(username);
    
    if (!user) {
      return {
        message: '使用者不存在或未啟用',
        data: null,
      };
    }

    // // 沒有啟用中的裝置
    // if (user.employee.active_device === null) {
    //   return {
    //     message: '使用者沒有啟用中的裝置',
    //     data: null,
    //   };
    // }
    
    return {
      message: '',
      data: {
        userId: user?.id,
        username: user?.username,
        isActive: user?.is_active,
        isAdmin: user?.is_admin,
        activeDeviceUuid: user.employee.active_device == null ? "" : user.employee.active_device.device_uuid,
      }
    };
  }
}