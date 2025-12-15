// src/employee/employee-schedule.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EmployeeSchedule } from '../../database/entities/employee-schedule.entity';
import { CreateEmployeeScheduleDto } from '../../database/dto/employee-schedule-config.dto';
import { v4 as uuidv4 } from 'uuid';
import { ShiftTemplate } from 'src/database/entities/shift-template.entity';

@Injectable()
export class EmployeeScheduleService {
  constructor(
    @InjectRepository(EmployeeSchedule)
    private scheduleRepository: Repository<EmployeeSchedule>,
    @InjectRepository(ShiftTemplate)
    private templateRepository: Repository<ShiftTemplate>,
  ) {}

  // 1. 查詢所有排班 (自動載入員工和模板資訊)
  async findAll(): Promise<EmployeeSchedule[]> {
    // 使用 relations 載入關聯資料，便於後台管理介面展示
    return this.scheduleRepository.find({ relations: ['employee', 'template'] });
  }

  // 2. 根據 ID 查詢單個排班
  async findById(id: string): Promise<EmployeeSchedule> {
    const schedule = await this.scheduleRepository.findOne({ 
        where: { id },
        relations: ['employee', 'template'] 
    });
    if (!schedule) {
        throw new NotFoundException(`找不到 ID 為 ${id} 的排班記錄。`);
    }
    return schedule;
  }

  // 3. 新增排班
  async create(dto: CreateEmployeeScheduleDto): Promise<EmployeeSchedule> {
    // 尋找班別模板是否存在
    const shiftTmeplateExist = await this.templateRepository.findOne({ where: { id: dto.shiftTemplateId } });
    // 建立排班 Entity，注意 DTO 欄位到 Entity 欄位的映射
    if(shiftTmeplateExist != null && dto.shiftTemplateId.trim().length > 0){
        const newSchedule = this.scheduleRepository.create({
            id:uuidv4(),
            employee_id: dto.employeeId,
            schedule_date: dto.scheduleDate,
            shift_template_id: dto.shiftTemplateId,
        });
        // 可以在此處加入防止同一天重複排班的檢查邏輯
        return this.scheduleRepository.save(newSchedule);
    } else {
        throw new NotFoundException('找不到指定班別模板資料！');
    }
  }

  // 4. 更新排班 (使用 findOne + save 模式)
  async update(id: string, dto: Partial<CreateEmployeeScheduleDto>): Promise<EmployeeSchedule> {
    const schedule = await this.findById(id); // 驗證記錄是否存在
    // 根據 DTO 更新對應的欄位
    if (dto.employeeId !== undefined) {
        schedule.employee_id = dto.employeeId;
    }
    if (dto.scheduleDate !== undefined) {
        schedule.schedule_date = dto.scheduleDate;
    }
    if (dto.shiftTemplateId !== undefined) {
        // 尋找班別模板是否存在
        const shiftTmeplateExist = await this.templateRepository.findOne({ where: { id: dto.shiftTemplateId } });
        if(shiftTmeplateExist == null){
            throw new NotFoundException('找不到班別模板資料。');
        }
        schedule.shift_template_id = dto.shiftTemplateId;
    }

    // 保存並返回更新後的 Entity
    return this.scheduleRepository.save(schedule);
  }

  // 5. 刪除排班
  async remove(id: string): Promise<void> {
    const result = await this.scheduleRepository.delete(id);
    if (result.affected === 0) {
        throw new NotFoundException(`找不到 ID 為 ${id} 的排班記錄，刪除失敗。`);
    }
  }
}