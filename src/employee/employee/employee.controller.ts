// src/employee/employee.controller.ts
import { Controller, Get, Post, Body, HttpCode, HttpStatus, Param, UseGuards, Query } from '@nestjs/common';
import { EmployeeService } from './employee.service';
import { CreateEmployeeDto } from '../../database/dto/employee-config.dto';
import { AuthGuard } from '@nestjs/passport';
import { ListEmployeeQueryDto } from 'src/database/dto/list-employee-query.dto';

@Controller('api/v1')
export class EmployeeController {
    constructor(private readonly employeeService: EmployeeService) {}

    @UseGuards(AuthGuard('jwt'))
    @Get('employees')
    async findAll(@Query() query: ListEmployeeQueryDto) {
        return this.employeeService.findAll(query);
    }

    @UseGuards(AuthGuard('jwt'))
    @Post('employee')
    @HttpCode(HttpStatus.CREATED)
    async create(@Body() dto: CreateEmployeeDto) {
        return this.employeeService.create(dto);
    }

    @UseGuards(AuthGuard('jwt'))
    @Get('employee/:id')
    async findById(@Body('id') id: string) {
        return this.employeeService.findById(id);
    }

    // 更新員工資料
    @UseGuards(AuthGuard('jwt'))
    @Post('employee/:id')
    @HttpCode(HttpStatus.OK)
    async update(@Param('id') id: string, @Body() dto: Partial<CreateEmployeeDto>) {
        return this.employeeService.update(id, dto);
    }
}