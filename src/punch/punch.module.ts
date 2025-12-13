// src/punch/punch.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PunchController } from './punch.controller';
import { PunchService } from '../punch/punch/punch.service';
import { PunchLog } from '../database/entities/punch-log.entity'; // 匯入 PunchLog
import { PunchPoint } from '../database/entities/punch-point.entity'; // 匯入 PunchPoint
import { CommonModule } from '../common/common.module'; // 引入 Common 模組來使用 GeoService

@Module({
  imports: [
    // 註冊本模組會用到的 Entity
    TypeOrmModule.forFeature([
      PunchLog,
      PunchPoint,
    ]),
    CommonModule, // 允許 PunchModule 注入 GeoService
  ],
  controllers: [PunchController],
  providers: [PunchService],
})
export class PunchModule {}