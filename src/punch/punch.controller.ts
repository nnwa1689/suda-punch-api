// src/punch/punch.controller.ts
import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { PunchService } from './punch/punch.service';
import { PunchDto } from 'src/database/dto/punch.dto'; 
import moment from 'moment';

@Controller('api/v1/punch')
export class PunchController {
  constructor(private readonly punchService: PunchService) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  async punch(@Body() body: PunchDto) {
    
    const result = await this.punchService.submitPunch(
      body.employeeId,
      body.deviceUuid,
      body.latitude,
      body.longitude,
      body.type,
      body.punchPointsId,
    );
    
    return {
      message: '打卡請求已處理，GPS 和裝置驗證通過。',
      punch_id: result.id,
      punch_time: moment(result.punch_time).utcOffset(8).format('YYYY-MM-DD HH:mm:ss'),
      //status: result.status,
    };
  }
}