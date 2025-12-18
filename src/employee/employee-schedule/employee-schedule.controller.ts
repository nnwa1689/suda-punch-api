// src/employee/employee-schedule.controller.ts
import { Controller, Get, Post, Body, HttpCode, HttpStatus, Param, Patch, Delete, UseGuards } from '@nestjs/common';
import { EmployeeScheduleService } from './employee-schedule.service';
import { CreateEmployeeScheduleDto } from '../../database/dto/employee-schedule-config.dto';
import { AuthGuard } from '@nestjs/passport';

@Controller('api/v1/schedule') // 使用專門的排班路徑
export class EmployeeScheduleController {
  constructor(private readonly scheduleService: EmployeeScheduleService) {}

  @UseGuards(AuthGuard('jwt'))
  @Get()
  async findAll() {
    return this.scheduleService.findAll();
  }

  @UseGuards(AuthGuard('jwt'))
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.scheduleService.findById(id);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() dto: CreateEmployeeScheduleDto) {
    return this.scheduleService.create(dto);
  }

  @UseGuards(AuthGuard('jwt'))
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() dto: Partial<CreateEmployeeScheduleDto>,
  ) {
    return this.scheduleService.update(id, dto);
  }

  @UseGuards(AuthGuard('jwt'))
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string) {
    await this.scheduleService.remove(id);
  }
}