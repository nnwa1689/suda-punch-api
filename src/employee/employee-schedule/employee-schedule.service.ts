// src/employee/employee-schedule.service.ts
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Repository } from 'typeorm';
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

  /**
   * 查詢所有排班 (自動載入員工和模板資訊)
   * @returns 
   */
  async findAll(): Promise<EmployeeSchedule[]> {
    // 使用 relations 載入關聯資料，便於後台管理介面展示
    return this.scheduleRepository.find({ relations: ['employee', 'template'] });
  }

  /**
   * 根據 SCHE ID 查詢單個排班
   * @param id 
   * @returns 
   */
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

  /**
   * 新增排班
   * @param dto 
   * @returns 
   */
  async create(dto: CreateEmployeeScheduleDto): Promise<EmployeeSchedule> {
    // 尋找班別模板是否存在
    const shiftTmeplateExist = await this.templateRepository.findOne({ where: { id: dto.shiftTemplateId } });
    // 建立排班 Entity，注意 DTO 欄位到 Entity 欄位的映射
    if(shiftTmeplateExist != null && dto.shiftTemplateId.trim().length > 0){
        // 確認是否重複排班
        const scheduleIsExist = await this.scheduleRepository.findOne( 
          { where:  
            { 
              employee_id: dto.employeeId, 
              schedule_date: dto.scheduleDate, 
              shift_template_id: dto.shiftTemplateId
            }
          });

        if(scheduleIsExist != null){
          throw new BadRequestException(`員工 ${dto.employeeId} 在 ${dto.scheduleDate} 已有 ${dto.shiftTemplateId} 班別排班記錄，新增失敗。`);
        }

        const newSchedule = this.scheduleRepository.create({
            id:uuidv4(),
            employee_id: dto.employeeId,
            schedule_date: dto.scheduleDate,
            shift_template_id: dto.shiftTemplateId,
        });

        return this.scheduleRepository.save(newSchedule);
    } else {
        throw new NotFoundException('找不到指定班別模板資料！');
    }
  }

  /**
   * 更新排班 (使用 findOne + save 模式)
   * @param id 
   * @param dto 
   * @returns 
   */
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

  /**
   * 刪除排班(實際執行DEL動作)
   * @param id 
   */
  async remove(id: string): Promise<void> {
    const result = await this.scheduleRepository.delete(id);
    if (result.affected === 0) {
        throw new NotFoundException(`找不到 ID 為 ${id} 的排班記錄，刪除失敗。`);
    }
  }

  /**
     * 根據員工ID和日期查找排班記錄
     * @param employeeId 員工 UUID
     * @param date 要查詢的日期
     */
  async findByEmployeeAndDate(employeeId: string, date: Date): Promise<EmployeeSchedule | null> {
        // 註: 為了精確匹配日期，您可能需要將 date 轉換為 YYYY-MM-DD 格式，
        // 或使用資料庫特定的日期函數。這裡假設您的資料庫設定能接受 Date 物件的日期部分。
        
        // 由於 schedule_date 在資料庫中可能是 Date 類型，我們需要確保查詢條件只比對日期部分
        // 這裡為了簡潔，我們先假設傳入的 date 已經被處理為當天的 00:00:00

        const startOfDay = new Date(date);
        startOfDay.setHours(0, 0, 0, 0); // 將時間設置為當天開始

        // 2. 建立當天的結束時間 (23:59:59.999)
        const endOfDay = new Date(date);
        endOfDay.setHours(23, 59, 59, 999); // 將時間設置為當天結束
        
        return this.scheduleRepository.findOne({
            where: {
                employee_id: employeeId,
                schedule_date: Between(startOfDay, endOfDay), // 這裡需要 TypeORM 能夠正確比對日期
            },
            relations: ['employee', 'template'], // 必須載入 template 才能判斷遲到
        });
    }

  /**
   * 取得特定人員最新排班紀錄
   * @param employeeId 
   * @returns 
   */
  async getNearestSchedule(employeeId: string) {
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];

    const schedule = await this.scheduleRepository.createQueryBuilder('schedule')
      // 1. 關聯 shift_templates 表
      // 假設實體中的關聯屬性名為 shiftTemplate
      .leftJoinAndSelect('schedule.template', 'shift') 
      .where('schedule.employee_id = :employeeId', { employeeId })
      .andWhere('schedule.schedule_date >= :today', { today: todayStr })
      .orderBy('schedule.schedule_date', 'ASC')
      .addOrderBy('shift.start_time_h', 'ASC')
      .addOrderBy('shift.start_time_m', 'ASC')
      .getOne();

    return schedule;
  }
}