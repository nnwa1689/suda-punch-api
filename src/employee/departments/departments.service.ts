// src/departments/departments.service.ts
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Department } from '../../database/entities/department.entity';
import { CreateDepartmentDto } from '../../database/dto/create-department.dto';
import { UpdateDepartmentDto } from '../../database/dto/update-department.dto';

@Injectable()
export class DepartmentsService {
  constructor(
    @InjectRepository(Department)
    private readonly deptRepo: Repository<Department>,
  ) {}

  // 1. 建立部門
  async create(createDto: CreateDepartmentDto) {
    const dept = this.deptRepo.create(createDto);
    return await this.deptRepo.save(dept);
  }

  // 2. 更新部門 (包含停用)
  async update(id: string, updateDto: UpdateDepartmentDto) {
    const dept = await this.deptRepo.findOneBy({ id });
    if (!dept) throw new NotFoundException('找不到該部門');

    // 商業邏輯：如果要停用部門，可以檢查是否還有在職員工 (選做)
    // if (updateDto.is_active === false) { ... }

    Object.assign(dept, updateDto);
    return await this.deptRepo.save(dept);
  }

  // 3. 列表 (供後台管理使用)
  async findAll() {
    return await this.deptRepo.find({
      order: { id: 'ASC' }
    });
  }

  // 4. 下拉選單專用 (僅回傳啟用中的部門，且只拿必要欄位)
  async getActiveList() {
    return await this.deptRepo.find({
      where: { is_active: true },
      select: ['id', 'name'],
      order: { name: 'ASC' }
    });
  }
}