// src/employee/employee.controller.ts
import { Controller, Get, Post, Body, HttpCode, HttpStatus, Param } from '@nestjs/common';
import { EmployeeService } from './employee.service';
import { CreateEmployeeDto } from '../../database/dto/employee-config.dto';

@Controller('api/v1')
export class EmployeeController {
    constructor(private readonly employeeService: EmployeeService) {}

    @Get('employees')
    async findAll() {
        return this.employeeService.findAll();
    }

    @Post('employee')
    @HttpCode(HttpStatus.CREATED)
    async create(@Body() dto: CreateEmployeeDto) {
        return this.employeeService.create(dto);
    }

    @Get('employee/:id')
    async findById(@Body('id') id: string) {
        return this.employeeService.findById(id);
    }

    // 更新員工資料
    @Post('employee/:id')
    @HttpCode(HttpStatus.OK)
    async update(@Param('id') id: string, @Body() dto: Partial<CreateEmployeeDto>) {
        return this.employeeService.update(id, dto);
    }
}