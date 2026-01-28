import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { SudaBase } from 'src/database/entities/suda-base.entity';
import { Repository } from 'typeorm';

@Injectable()
export class CommonService {
  constructor(
    @InjectRepository(SudaBase)
    private sudaBaseRepository: Repository<SudaBase>,
  ) {}

    async findById(id: string): Promise<SudaBase | null> {
      const found = await this.sudaBaseRepository.findOne({
        where: { base_id: id }
      });

    if (!found) {
        throw new NotFoundException(`找不到 ID 為 ${id} 的系統資料`);
    }
      return found;
    }

    async updateById(id: string, value: string): Promise<SudaBase | null> {
      if (!value) {
        throw new NotFoundException(`更新內容不得為空`);
      }
      
      await this.sudaBaseRepository.update({ base_id: id }, { base_value: value });
      const found = await this.sudaBaseRepository.findOne({
        where: { base_id: id }
      });

    if (!found) {
        throw new NotFoundException(`找不到 ID 為 ${id} 的系統資料`);
    }
      return found;
    }
}
