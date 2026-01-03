// src/departments/departments.controller.ts
import { Controller, Get, Post, Body, Patch, Param, UseGuards } from '@nestjs/common';
import { DepartmentsService } from './departments.service';
import { CreateDepartmentDto } from '../../database/dto/create-department.dto';
import { UpdateDepartmentDto } from '../../database/dto/update-department.dto';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { AdminGuard } from 'src/auth/admin.guard';

@ApiTags('部門管理')
@Controller('api/v1/departments')
export class DepartmentsController {
  constructor(private readonly deptService: DepartmentsService) {}

  @UseGuards(AuthGuard('jwt'), AdminGuard)
  @Post()
  @ApiOperation({ summary: '建立新部門' })
  async create(@Body() createDto: CreateDepartmentDto) {
    return { data: await this.deptService.create(createDto) };
  }

  @UseGuards(AuthGuard('jwt'))
  @Get()
  @ApiOperation({ summary: '獲取所有部門列表' })
  async findAll() {
    return { data: await this.deptService.findAll() };
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('active')
  @ApiOperation({ summary: '獲取啟用中的部門選單' })
  async getActive() {
    return { data: await this.deptService.getActiveList() };
  }

  @UseGuards(AuthGuard('jwt'), AdminGuard)
  @Patch(':id')
  @ApiOperation({ summary: '更新部門資料/停用' })
  async update(@Param('id') id: string, @Body() updateDto: UpdateDepartmentDto) {
    return { data: await this.deptService.update(id, updateDto) };
  }

  //TODO: 未來新增可透過id及名稱查詢部門，應用於部門選擇器
}