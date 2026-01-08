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

    //3. 根據 ID 查詢員工
    async findById(id: string): Promise<SudaBase | null> {
      const found = await this.sudaBaseRepository.findOne({
        where: { base_id: id }
      });

    if (!found) {
        throw new NotFoundException(`找不到 ID 為 ${id} 的系統資料`);
    }
      return found;
    }
}
