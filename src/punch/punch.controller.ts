// src/punch/punch.controller.ts
import { Controller, Post, Body, HttpCode, HttpStatus, UseGuards, BadRequestException, Request, Get, Query, ValidationPipe, Req} from '@nestjs/common';
import { PunchService } from './punch/punch.service';
import { PunchDto } from 'src/database/dto/punch.dto'; 
import { AuthGuard } from '@nestjs/passport';
import moment from 'moment';
import { HrQueryPunchDto } from 'src/database/dto/hr-query-punch.dto';
import { MyPunchQueryDto } from 'src/database/dto/my-punch-query.dto';

@Controller('api/v1/punch')
export class PunchController {
  constructor(private readonly punchService: PunchService) {}

  /**
   * 打卡API
   * @param req 
   * @param body 
   * @returns 
   */
  @UseGuards(AuthGuard('jwt'))
  @Post()
  @HttpCode(HttpStatus.OK)
  async punch(@Request() req, @Body() body: PunchDto) {
    
    const employeeId = req.user.employeeId;
    if (!employeeId) {
      throw new BadRequestException('當前帳號未連結有效的員工資料');
    }
    
    const result = await this.punchService.submitPunch(
      employeeId,
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

  /**
   * 取得所有人員打卡寄紀錄（後台）
   * @param dto 
   * @returns 
   */
  @UseGuards(AuthGuard('jwt')) // 建議之後加入 @Roles('admin') 守衛
  @Post('admin/all')
  async hrGetAllRecords(@Body() dto: HrQueryPunchDto) {
    // 實務上這裡應檢查 req.user.role 是否為 HR/Admin
    const records = await this.punchService.getAdminPunchRecords(dto);
    
    return {
      success: true,
      count: records.length,
      data: records
    };
  }

  /**
   * 取得員工所有打卡紀錄
   * @param req 
   * @param query 
   * @returns 
   */
  @UseGuards(AuthGuard('jwt'))
  @Post('my-records') // 員工專用路徑
  async getMyRecords(
    @Req() req: any, 
    @Body() query: MyPunchQueryDto
  ) {
    // 從 JWT 解析後的 user 物件取得 id (假設 key 名稱為 sub 或 id)
    const employeeId = req.user.employeeId; 
    const result = await this.punchService.getMyPunchRecords(employeeId, query);
    
    return {
      success: true,
      ...result
    };
  }

  /**
   * 取得特定員工最後一筆打卡資料
   * @param req 
   * @returns 
   */
  @UseGuards(AuthGuard('jwt'))
  @Get('last')
  async getLastPunch(@Req() req: any) {
    const employeeId = req.user.employeeId;
    const lastPunch = await this.punchService.getLastPunch(employeeId);
    
    return {
      success: true,
      data: lastPunch || null // 如果從未打過卡，回傳 null
    };
  }
}