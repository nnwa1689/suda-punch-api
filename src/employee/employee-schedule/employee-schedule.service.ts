// src/employee/employee-schedule.service.ts
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Not, Repository } from 'typeorm';
import { EmployeeSchedule } from '../../database/entities/employee-schedule.entity';
import { CreateEmployeeScheduleDto } from '../../database/dto/employee-schedule-config.dto';
import { v4 as uuidv4 } from 'uuid';
import { ShiftTemplate } from 'src/database/entities/shift-template.entity';
import { GeoService } from 'src/common/geo/geo.service';
import moment from 'moment';
import { Employee } from 'src/database/entities/employee.entity';

@Injectable()
export class EmployeeScheduleService {
  constructor(
    @InjectRepository(EmployeeSchedule)
    private scheduleRepository: Repository<EmployeeSchedule>,
    @InjectRepository(ShiftTemplate)
    private templateRepository: Repository<ShiftTemplate>,
    @InjectRepository(Employee)
    private employeeRepository: Repository<Employee>,
    private geoService: GeoService,
  ) {}

  /**
   * 查詢所有排班 (自動載入員工和模板資訊)
   * @returns 
   */
  async findAll(query: any): Promise<EmployeeSchedule[]> {
    const page = parseInt(query.page) || 1;
    const limit = parseInt(query.limit) || 10;
    return this.scheduleRepository.createQueryBuilder('schedule')
    .leftJoinAndSelect('schedule.employee', 'emp') 
    .leftJoinAndSelect('schedule.template', 'template')
    .orderBy('schedule.schedule_date', 'DESC')
    .skip((page - 1) * limit)
    .take(limit)
    .getMany();
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
    // 確認員工是否存在
    const employeeExist = await this.employeeRepository.findOne({ where: { id: dto.employeeId, is_active: true } });
    if(!employeeExist){
        throw new NotFoundException('找不到指定員工資料！');
    }
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

        // 如果新增的 schedule_type 是 fixed，才檢查以下邏輯
        if(dto.scheduleType === 'fixed'){
          // 同時檢查當月排班是否已存在 schedule_type 為 fixed 的
          const scheduleTypeExist = await this.isFixedScheduleExistForMonth(dto.employeeId, dto.scheduleDate);
          if(scheduleTypeExist){
            throw new BadRequestException(`員工 ${dto.employeeId} 在 ${new Date(dto.scheduleDate).toISOString().slice(0,7)} 月份 已有 固定 排班記錄，新增失敗。`);
          }
        }

        if(scheduleIsExist != null){
          throw new BadRequestException(`員工 ${dto.employeeId} 在 ${dto.scheduleDate} 已有 ${dto.shiftTemplateId} 班別排班記錄，新增失敗。`);
        }

        const newSchedule = this.scheduleRepository.create({
            id:uuidv4(),
            employee_id: dto.employeeId,
            schedule_date: dto.scheduleDate,
            shift_template_id: dto.shiftTemplateId,
            schedule_type: dto.scheduleType,
        });

        return this.scheduleRepository.save(newSchedule);
    } else {
        throw new NotFoundException('找不到指定班別模板資料！');
    }
  }
  
  /**
   * 查詢特定員工在該月是否已有固定排班
   * @param employeeId 
   * @param scheduleDate 
   * @returns 
   */
  private async isFixedScheduleExistForMonth(employeeId: string, scheduleDate: Date, skipId?: string | undefined): Promise<boolean> {
    // 請調整一下條件，加入 skipId 的判斷
    const existingSchedule = await this.scheduleRepository.find({
        where: {
            employee_id: employeeId,
            schedule_date: Between(
              new Date(new Date(scheduleDate).getFullYear(), new Date(scheduleDate).getMonth(), 1),
              new Date(new Date(scheduleDate).getFullYear(), new Date(scheduleDate).getMonth() + 1, 0)
            ),
            schedule_type: 'fixed',
            ...(skipId ? { id: Not(skipId) } : {}), // 如果有 skipId，則排除該 ID
        },
    });

    return existingSchedule.length > 0;
}

  /**
   * 查詢特定員工在該月的固定排班
   * @param employeeId 
   * @param scheduleDate 
   * @returns 
   */
  public async findOneFixedScheduleExistForMonth(employeeId: string, scheduleDate: Date, skipId?: string | undefined): Promise<EmployeeSchedule | null> {
    // 請調整一下條件，加入 skipId 的判斷
    const existingSchedule = await this.scheduleRepository.findOne({
        where: {
            employee_id: employeeId,
            schedule_date: Between(
              new Date(new Date(scheduleDate).getFullYear(), new Date(scheduleDate).getMonth(), 1),
              new Date(new Date(scheduleDate).getFullYear(), new Date(scheduleDate).getMonth() + 1, 0)
            ),
            schedule_type: 'fixed',
            ...(skipId ? { id: Not(skipId) } : {}), // 如果有 skipId，則排除該 ID
        },
    });
    return existingSchedule;
}

  /**
   * 更新排班 (使用 findOne + save 模式)
   * @param id 
   * @param dto 
   * @returns 
   */
  async update(id: string, dto: CreateEmployeeScheduleDto): Promise<EmployeeSchedule> {
    const schedule = await this.findById(id); // 驗證記錄是否存在
    // 根據 DTO 更新對應的欄位
    if (dto.employeeId !== undefined) {
        schedule.employee_id = dto.employeeId;
    }
    if (dto.scheduleDate !== undefined) {
        schedule.schedule_date = dto.scheduleDate;
    }
    if (dto.scheduleType !== undefined) {
      if(dto.scheduleType === 'fixed'){
        // 同時檢查當月排班是否已存在 schedule_type 為 fixed 的
        const scheduleTypeExist = await this.isFixedScheduleExistForMonth(schedule.employee_id, schedule.schedule_date, id);
        if(scheduleTypeExist){ 
          throw new BadRequestException(`員工 ${schedule.employee_id} 在 ${new Date(schedule.schedule_date).toISOString().slice(0,7)} 月份 已有 固定 排班記錄，更新失敗。`);
        }
      }
      schedule.schedule_type = dto.scheduleType;
    }

    if (dto.shiftTemplateId !== undefined) {
        // 尋找班別模板是否存在
        const shiftTmeplateExist = await this.templateRepository.findOne({ where: { id: dto.shiftTemplateId } });
        if(shiftTmeplateExist == null){
            throw new NotFoundException('找不到班別模板資料。');
        }
        schedule.shift_template_id = dto.shiftTemplateId;
    }

    await this.scheduleRepository
        .createQueryBuilder()
        .update(EmployeeSchedule)
        .set({
          // 這裡左邊的 Key 必須完全對應 Entity 裡的屬性名稱
          employee_id: dto.employeeId,
          schedule_date: dto.scheduleDate,
          shift_template_id: dto.shiftTemplateId,
          schedule_type: dto.scheduleType,
          updated_at: new Date()
        })
        .where("id = :id", { id })
        .execute();

      // 3. 重新抓取
      return await this.findById(id);
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
    const todayStr = moment(this.geoService.getSystemTime()).format('YYYY-MM-DD');

    var schedule:EmployeeSchedule | null = await this.scheduleRepository.createQueryBuilder('schedule')
      .leftJoinAndSelect('schedule.template', 'shift') 
      .where('schedule.employee_id = :employeeId', { employeeId })
      .andWhere('schedule.schedule_date = :today', { today: todayStr })
      .orderBy('schedule.schedule_date', 'ASC')
      .addOrderBy('shift.start_time_h', 'ASC')
      .addOrderBy('shift.start_time_m', 'ASC')
      .getOne();

    if(!schedule){
      // 如果找不到排班，則尋找該月是否有固定班別，且要 leftjoin 班別模板 
      schedule = await this.scheduleRepository.createQueryBuilder('schedule')
        .leftJoinAndSelect('schedule.template', 'shift') 
        .where('schedule.employee_id = :employeeId', { employeeId })
        .andWhere('schedule.schedule_type = :scheduleType', { scheduleType: 'fixed' })
        .andWhere('schedule.schedule_date BETWEEN :startOfMonth AND :endOfMonth', { 
          startOfMonth: new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0],
          endOfMonth: new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0],
        })
        .orderBy('schedule.schedule_date', 'ASC')
        .addOrderBy('shift.start_time_h', 'ASC')
        .addOrderBy('shift.start_time_m', 'ASC')
        .getOne();
    }

    return schedule;
  }
}