// src/employee/shift-template.controller.ts
import { Controller, Get, Post, Body, HttpCode, HttpStatus, Param, Patch, Delete } from '@nestjs/common';
import { ShiftTemplateService } from './shift-template.service';
import { CreateShiftTemplateDto } from '../../database/dto/shift-template-config.dto';

@Controller('api/v1/shift/template')
export class ShiftTemplateController {
  constructor(private readonly templateService: ShiftTemplateService) {}

  @Get() // 查詢所有
  async findAll() {
    return this.templateService.findAll();
  }

  @Get(':id') // 查詢單個
  async findOne(@Param('id') id: string) {
    return this.templateService.findById(id);
  }

  @Post() // 新增
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() dto: CreateShiftTemplateDto) {
    return this.templateService.create(dto);
  }

  @Patch(':id') // 更新
  async update(
    @Param('id') id: string,
    @Body() dto: Partial<CreateShiftTemplateDto>,
  ) {
    return this.templateService.update(id, dto);
  }

  @Post('toggleIsActive/:id') // 停用班別
  @HttpCode(HttpStatus.OK)
  async toggleIsActive(@Param('id') id: string) {
    await this.templateService.toggleIsActive(id);
  }
}