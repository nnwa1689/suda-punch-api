import { Controller, Post, Body, Get, Query, UseGuards, Param } from '@nestjs/common';
import { HolidayService } from './holiday.service';
import { AuthGuard } from '@nestjs/passport';
import { AdminGuard } from '../auth/admin.guard'; // 請根據您的路徑調整

@Controller('api/v1/holidays')
export class HolidayController {
  constructor(private readonly holidayService: HolidayService) {}

  /**
   * 取得所有例假日
   * @param page 
   * @param limit 
   * @returns 
   */
  @UseGuards(AuthGuard('jwt'), AdminGuard)
  @Get()
  async getAll(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ) {
    return { data: await this.holidayService.findAll(page, limit) };
  }

  /**
   * 新增單筆例假日
   * @param data 
   * @returns 
   */
  @UseGuards(AuthGuard('jwt'), AdminGuard)
  @Post()
  async create(@Body() data: any) {
    return await this.holidayService.createOne(data);
  }

  /**
   * 取得單筆例假日
   * @param id 
   * @returns 
   */
  @UseGuards(AuthGuard('jwt'), AdminGuard)
  @Get(':id')
  async getOne(@Param('id') id: string) {
    const data = await this.holidayService.findOne(id);
    return {
        message: '查詢成功',
        data: data
    };
  }

  /**
   * 更新單筆例假日
   * @param id 
   * @param data 
   * @returns 
   */
  @UseGuards(AuthGuard('jwt'), AdminGuard)
  @Post('update/:id')
  async update(@Param('id') id: string, @Body() data: any) {
    return await this.holidayService.updateOne(id, data);
  }

  /**
   * 批次匯入政府例假日 JSON
   * @param data 
   * @returns 
   */
  @UseGuards(AuthGuard('jwt'), AdminGuard)
  @Post('import')
  async importHolidays(@Body() data: any[]) {
    return await this.holidayService.importFromGovernmentJson(data);
  }

  /**
   * 檢查日期是否為例假日
   * @param date 
   * @returns 
   */
  @UseGuards(AuthGuard('jwt'))
  @Get('get/check')
  async checkDate(@Query('date') date: string) {
    const isHoliday = await this.holidayService.isHoliday(date);
    return { data: { date, isHoliday } };
  }
}