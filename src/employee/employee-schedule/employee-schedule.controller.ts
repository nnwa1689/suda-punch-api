// src/employee/employee-schedule.controller.ts
import { Controller, Get, Post, Body, HttpCode, HttpStatus, Param, Patch, Delete, UseGuards, Req, Query } from '@nestjs/common';
import { EmployeeScheduleService } from './employee-schedule.service';
import { CreateEmployeeScheduleDto } from '../../database/dto/employee-schedule-config.dto';
import { AuthGuard } from '@nestjs/passport';

@Controller('api/v1/schedule') // 使用專門的排班路徑
export class EmployeeScheduleController {
  constructor(private readonly scheduleService: EmployeeScheduleService) {}

  /**
   * 取得系統所有排班紀錄
   * @returns 
   */
  @UseGuards(AuthGuard('jwt'))
  @Get()
  // 增加 page 和 limit 查詢參數
  async findAll(@Query() query: any) {
    return { data: await this.scheduleService.findAll(query) };
  }

  /**
   * 取得特定人ID排班紀錄
   * @param id 
   * @returns 
   */
  @UseGuards(AuthGuard('jwt'))
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return { data: await this.scheduleService.findById(id) };
  }

  /**
   * 建立單筆排班紀錄
   * @param dto 
   * @returns 
   */
  @UseGuards(AuthGuard('jwt'))
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() dto: CreateEmployeeScheduleDto) {
    return { data: await this.scheduleService.create(dto) };
  }

  /**
   * 更新特定一筆排班紀錄
   * @param id 
   * @param dto 
   * @returns 
   */
  @UseGuards(AuthGuard('jwt'))
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() dto: CreateEmployeeScheduleDto,
  ) {
    return { data: await this.scheduleService.update(id, dto) };
  }

  /**
   * 實際刪除一筆排班紀錄
   * @param id 
   */
  @UseGuards(AuthGuard('jwt'))
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string) {
    await this.scheduleService.remove(id);
  }

  /**
   * 取得特定人員最後一筆打卡紀錄(JWT)
   * @param req 
   * @returns 
   */
  @UseGuards(AuthGuard('jwt'))
  @Get('get/today-nearest')
  async getTodayNearest(@Req() req: any) {
    const employeeId = req.user.employeeId;
    const schedule = await this.scheduleService.getNearestSchedule(employeeId);

    if (!schedule || !schedule.template) {
      return { message: '近期無排班', data: null };
    }

    const st = schedule.template;

    // 格式化時間輔助函式：確保 9 變成 "09"
    const formatTime = (h: number, m: number) => {
      return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
    };

    return {
      data:{ 
        id: schedule.id,
        date: schedule.schedule_date,
        shift: {
          id: st.id,
          name: st.name,
          is_cross_day: st.is_cross_day,
          startTime: formatTime(st.start_time_h, st.start_time_m),
          endTime: formatTime(st.end_time_h, st.end_time_m),
          isActive: st.is_active
        }
      }
    };
  }
}