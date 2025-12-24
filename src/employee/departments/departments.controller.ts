// src/departments/departments.controller.ts
import { Controller, Get, Post, Body, Patch, Param } from '@nestjs/common';
import { DepartmentsService } from './departments.service';
import { CreateDepartmentDto } from '../../database/dto/create-department.dto';
import { UpdateDepartmentDto } from '../../database/dto/update-department.dto';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('部門管理')
@Controller('api/v1/departments')
export class DepartmentsController {
  constructor(private readonly deptService: DepartmentsService) {}

  @Post()
  @ApiOperation({ summary: '建立新部門' })
  create(@Body() createDto: CreateDepartmentDto) {
    return this.deptService.create(createDto);
  }

  @Get()
  @ApiOperation({ summary: '獲取所有部門列表' })
  findAll() {
    return this.deptService.findAll();
  }

  @Get('active')
  @ApiOperation({ summary: '獲取啟用中的部門選單' })
  getActive() {
    return this.deptService.getActiveList();
  }

  @Patch(':id')
  @ApiOperation({ summary: '更新部門資料/停用' })
  update(@Param('id') id: string, @Body() updateDto: UpdateDepartmentDto) {
    return this.deptService.update(id, updateDto);
  }

  //TODO: 未來新增可透過id及名稱查詢部門，應用於部門選擇器
}