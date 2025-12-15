// src/employee/shift-template.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ShiftTemplate } from '../../database/entities/shift-template.entity';
import { CreateShiftTemplateDto } from '../../database/dto/shift-template-config.dto';

@Injectable()
export class ShiftTemplateService {
  constructor(
    @InjectRepository(ShiftTemplate)
    private templateRepository: Repository<ShiftTemplate>,
  ) {}

  // 1. 查詢所有班別模板
  async findAll(): Promise<ShiftTemplate[]> {
    return this.templateRepository.find();
  }

  // 2. 根據 ID 查詢單個模板 (UUID)
  async findById(id: string): Promise<ShiftTemplate> {
    const template = await this.templateRepository.findOne({ where: { id } });
    if (!template) {
        throw new NotFoundException(`找不到 ID 為 ${id} 的班別模板。`);
    }
    return template;
  }

  // 3. 新增班別模板
  async create(dto: CreateShiftTemplateDto): Promise<ShiftTemplate> {
    // 映射 DTO 欄位到 Entity 欄位（採用駝峰轉蛇形）
    const newTemplate = this.templateRepository.create({
        name: dto.name,
        is_cross_day: dto.isCrossDay,
        start_time_h: dto.startTimeH,
        start_time_m: dto.startTimeM,
        end_time_h: dto.endTimeH,
        end_time_m: dto.endTimeM,
    });
    return this.templateRepository.save(newTemplate);
  }

  // 4. 更新班別模板 (使用 findOne + save 模式)
  async update(id: string, dto: Partial<CreateShiftTemplateDto>): Promise<ShiftTemplate> {
    const template = await this.findById(id); // 驗證記錄是否存在

    // 根據 DTO 存在的值進行更新
    template.name = dto.name ?? template.name;
    template.is_cross_day = dto.isCrossDay ?? template.is_cross_day;
    template.start_time_h = dto.startTimeH ?? template.start_time_h;
    template.start_time_m = dto.startTimeM ?? template.start_time_m;
    template.end_time_h = dto.endTimeH ?? template.end_time_h;
    template.end_time_m = dto.endTimeM ?? template.end_time_m;

    return this.templateRepository.save(template);
  }

  // 5. 刪除班別模板
  async remove(id: string): Promise<void> {
    const result = await this.templateRepository.delete(id);
    if (result.affected === 0) {
        throw new NotFoundException(`找不到 ID 為 ${id} 的班別模板，刪除失敗。`);
    }
  }
}