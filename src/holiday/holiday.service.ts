import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Holiday } from '../database/entities/holidays.entity';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class HolidayService {
  constructor(
    @InjectRepository(Holiday)
    private holidayRepository: Repository<Holiday>,
  ) {}

  // 1. 單筆新增
  async createOne(data: Partial<Holiday>) {
    const holiday = new Holiday(); // 這會觸發 constructor 產生 UUID
    Object.assign(holiday, data);
    return await this.holidayRepository.save(holiday);
  }

  // 2. 編輯單筆
  async updateOne(id: string, updateData: Partial<Holiday>) {
    const holiday = await this.holidayRepository.findOne({ where: { id } });
    if (!holiday) throw new NotFoundException('找不到該假日紀錄');
    
    Object.assign(holiday, updateData);
    return await this.holidayRepository.save(holiday);
  }

  // 3. 查詢全部 (含分頁)
  async findAll(page: number = 1, limit: number = 10) {
    const [items, total] = await this.holidayRepository.findAndCount({
      order: { date: 'ASC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      items,
      total,
      page,
      lastPage: Math.ceil(total / limit),
    };
  }

  async findOne(id: string): Promise<Holiday> {
    const holiday = await this.holidayRepository.findOne({ where: { id } });
    
    if (!holiday) {
        throw new NotFoundException(`找不到 ID 為 ${id} 的假日紀錄`);
    }
    
    return holiday;
  }

  async importFromGovernmentJson(jsonData: any[]) {
    const entities = jsonData
      .filter(item => item.Subject && item['Start Date'])
      .map(item => {
        const holiday = new Holiday();
        holiday.id = uuidv4();
        holiday.subject = item.Subject;
        // 將 2026/1/1 轉為 2026-01-01
        holiday.date = item['Start Date'].replace(/\//g, '-');
        holiday.is_holiday = true;
        holiday.description = item.Description || '';
        return holiday;
      });

    // 使用 upsert 確保日期重複時自動更新資訊
    return await this.holidayRepository.upsert(entities, ['date']);
  }

  async isHoliday(date: string): Promise<boolean> {
    const found = await this.holidayRepository.findOne({
      where: { date, is_holiday: true }
    });
    return !!found;
  }
}