// src/employee/employee.service.ts
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Employee } from '../../database/entities/employee.entity';
import { CreateEmployeeDto } from '../../database/dto/employee-config.dto';
import { ListEmployeeQueryDto } from 'src/database/dto/list-employee-query.dto';

@Injectable()
export class EmployeeService {
    constructor(
        @InjectRepository(Employee)
        private employeeRepository: Repository<Employee>,
    ) {}

    /**
     * 查詢所有員工
     * @returns 
     */
    async findAll(query: ListEmployeeQueryDto) {
        const { page = 1, limit = 10, name, departmentId, isActive } = query;
        const skip = (page - 1) * limit;

        const queryBuilder = this.employeeRepository.createQueryBuilder('emp')
            // 如果你有設定關聯，可以抓取部門名稱
            .leftJoinAndSelect('emp.department', 'dept') 
            .select([
            'emp.id',
            'emp.name',
            'emp.department_id',
            'emp.is_active',
            'emp.arrival',
            'emp.created_at',
            'dept.name' // 假設部門表有 name 欄位
            ]);

        // --- 動態篩選條件 ---
        if (name) {
            queryBuilder.andWhere('emp.name ILIKE :name', { name: `%${name}%` });
        }

        if (departmentId) {
            queryBuilder.andWhere('emp.department_id = :deptId', { deptId: departmentId });
        }

        if (isActive !== undefined) {
            queryBuilder.andWhere('emp.is_active = :isActive', { isActive: isActive === 'true' });
        }

        // --- 分頁與排序 ---
        const [data, total] = await queryBuilder
            .orderBy('emp.created_at', 'DESC')
            .skip(skip)
            .take(limit)
            .getManyAndCount();

        return {
            data,
            meta: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit)
            }
        };
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
                department_id: dto.departmentId,
                arrival: dto.arrival
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
                is_active: dto.isActive,
                arrival: dto.arrival
            }
        );
        // 檢查是否有記錄被影響
        if (updateResult.affected === 0) {
            throw new NotFoundException(`員工 ${ id } 更新失敗。`);
        }
        return this.findById(id);
    }
}