// src/employee/employee.service.ts
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Employee } from '../../database/entities/employee.entity';
import { CreateEmployeeDto } from '../../database/dto/employee-config.dto';

@Injectable()
export class EmployeeService {
    constructor(
        @InjectRepository(Employee)
        private employeeRepository: Repository<Employee>,
    ) {}

    // 1. 查詢所有員工
    async findAll(): Promise<Employee[]> {
        return this.employeeRepository.find();
    }

    // 2. 新增員工
    async create(dto: CreateEmployeeDto): Promise<Employee> {
        // 檢查員工是否已存在
        const isExist = await this.employeeRepository.findOne({ where: { id: dto.id } });
        if(isExist) {
            throw new BadRequestException(`員工 ${ dto.id } 已經存在。`);
        }
        const newEmployee = this.employeeRepository.create(
            {
                id: dto.id,
                name: dto.name,
                is_active: dto.isActive,
                department_id: dto.departmentId
            }
        );
        return this.employeeRepository.save(newEmployee);
    }

    //3. 根據 ID 查詢員工
    async findById(id: string): Promise<Employee | null> {
        return this.employeeRepository.findOne({ where: { id } });
    }

    //4. 更新員工資料，包含停用
    async update(id: string, dto: Partial<CreateEmployeeDto>): Promise<Employee | null> {
        const updateResult = await this.employeeRepository.update(
            {id: id}, 
            {
                name: dto.name,
                department_id: dto.departmentId,
                is_active: dto.isActive
            }
        );
        // 檢查是否有記錄被影響
        if (updateResult.affected === 0) {
            throw new NotFoundException(`員工 ${ id } 更新失敗。`);
        }
        return this.findById(id);
    }
}