// src/employee/employee-schedule.controller.ts
import { Controller, Get, Post, Body, HttpCode, HttpStatus, Param, Patch, Delete } from '@nestjs/common';
import { EmployeeScheduleService } from './employee-schedule.service';
import { CreateEmployeeScheduleDto } from '../../database/dto/employee-schedule-config.dto';

@Controller('api/v1/schedule') // 使用專門的排班路徑
export class EmployeeScheduleController {
  constructor(private readonly scheduleService: EmployeeScheduleService) {}

  @Get()
  async findAll() {
    return this.scheduleService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.scheduleService.findById(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() dto: CreateEmployeeScheduleDto) {
    return this.scheduleService.create(dto);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() dto: Partial<CreateEmployeeScheduleDto>,
  ) {
    return this.scheduleService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string) {
    await this.scheduleService.remove(id);
  }
}