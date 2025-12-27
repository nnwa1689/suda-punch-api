// src/employee/shift-template.controller.ts
import { Controller, Get, Post, Body, HttpCode, HttpStatus, Param, Patch, Delete, UseGuards } from '@nestjs/common';
import { ShiftTemplateService } from './shift-template.service';
import { CreateShiftTemplateDto } from '../../database/dto/shift-template-config.dto';
import { AuthGuard } from '@nestjs/passport';

@Controller('api/v1/shift/template')
export class ShiftTemplateController {
  constructor(private readonly templateService: ShiftTemplateService) {}

  @UseGuards(AuthGuard('jwt'))
  @Get() // 查詢所有
  async findAll() {
    return { data: await this.templateService.findAll() };
  }

  @UseGuards(AuthGuard('jwt'))
  @Get(':id') // 查詢單個
  async findOne(@Param('id') id: string) {
    return { data: await this.templateService.findById(id) };
  }

  @UseGuards(AuthGuard('jwt'))
  @Post() // 新增
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() dto: CreateShiftTemplateDto) {
    return { data: await this.templateService.create(dto) };
  }

  @UseGuards(AuthGuard('jwt'))
  @Patch(':id') // 更新
  async update(
    @Param('id') id: string,
    @Body() dto: Partial<CreateShiftTemplateDto>,
  ) {
    return { data: await this.templateService.update(id, dto) };
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('toggleIsActive/:id') // 停用班別
  @HttpCode(HttpStatus.OK)
  async toggleIsActive(@Param('id') id: string) {
    return { data: await this.templateService.toggleIsActive(id) };
  }
}