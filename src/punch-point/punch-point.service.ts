import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreatePunchPointDto } from '../database/dto/create-punch-point.dto';
import { UpdatePunchPointDto } from '../database/dto/update-punch-point.dto';
import { Repository } from 'typeorm';
import { PunchPoint } from '../database/entities/punch-point.entity';

@Injectable()
export class PunchPointService {
  constructor(
    @InjectRepository(PunchPoint)
    private punchPointRepository: Repository<PunchPoint>,
  ) {}

  /**
   * 建立打卡點
   * @param createPunchPointDto 
   * @returns 
   */
  async create(createPunchPointDto: CreatePunchPointDto) {
    const punchPointExist = await this.punchPointRepository.findOne({ where: { id: createPunchPointDto.id } });
    if (punchPointExist) {
      throw new NotFoundException(`打卡點 ID ${createPunchPointDto.id} 已存在`);
    }

    const punchPointData = {
      id: createPunchPointDto.id,
      name: createPunchPointDto.name,
      latitude: createPunchPointDto.latitude,
      longitude: createPunchPointDto.longitude,
      radius_meters: createPunchPointDto.radiusMeters ?? 100, // 轉換命名並給予預設值
      is_active: createPunchPointDto.isActive ?? true,  // 轉換命名
      verify_type: createPunchPointDto.verifyType,      // 轉換命名
      wifi_ssid: createPunchPointDto.wifiSsid,          // 轉換命名
      wifi_bssid_list: createPunchPointDto.wifiBssidList ?? [], // 轉換命名
    };

    const punchPoint = this.punchPointRepository.create(punchPointData);
    return this.punchPointRepository.save(punchPoint);
  }

  async findAll(keyword?: string) {
    const queryBuilder = this.punchPointRepository.createQueryBuilder('punchPoint');

    if (keyword) {
      // 使用 Brackets (括號) 來包裹 OR 邏輯，確保查詢安全
      queryBuilder.andWhere(
        '(punchPoint.id ILIKE :id OR punchPoint.name ILIKE :name)',
        { 
          id: `%${keyword}%` ,              // ID 通常是精確匹配
          name: `%${keyword}%`      // 名稱使用模糊匹配
        }
      );
    }

    return queryBuilder
      .orderBy('punchPoint.id', 'ASC')
      .getMany();
  }

  async findOne(id: string) {
    const punchPoint = await this.punchPointRepository.findOne({ where: { id } });
    if (!punchPoint) {
      throw new NotFoundException(`未找到打卡點 ID ${id} `);
    }
    return punchPoint;
  }

  async update(id: string, updatePunchPointDto: UpdatePunchPointDto) {
    const punchPoint = await this.punchPointRepository.findOne({ where: { id } });
    if (!punchPoint) {
      throw new NotFoundException(`未找到打卡點 ID ${id} `);
    }
    await this.punchPointRepository.update(id, 
      {
        name: updatePunchPointDto.name,
        latitude: updatePunchPointDto.latitude,
        longitude: updatePunchPointDto.longitude,
        radius_meters: updatePunchPointDto.radiusMeters,
        is_active: updatePunchPointDto.isActive,
        verify_type: updatePunchPointDto.verifyType,      // 轉換命名
        wifi_ssid: updatePunchPointDto.wifiSsid,          // 轉換命名
        wifi_bssid_list: updatePunchPointDto.wifiBssidList ?? [], // 轉換命名
      });
    return this.punchPointRepository.findOne({ where: { id } });
  }

  /**
   * 停用打卡點
   * @param id 
   * @returns 
   */
  async remove(id: string) {
    const punchPoint = await this.punchPointRepository.findOne({ where: { id } });
    if (!punchPoint) {
      throw new NotFoundException(`未找到打卡點 ID ${id} `);
    }
    await this.punchPointRepository.update(id, { is_active: !punchPoint.is_active });
    return this.punchPointRepository.findOne({ where: { id } });
  }
}
