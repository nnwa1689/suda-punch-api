import { Module } from '@nestjs/common';
import { PunchPointService } from './punch-point.service';
import { PunchPointController } from './punch-point.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PunchPoint } from 'src/database/entities/punch-point.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      PunchPoint
    ]),
  ],
  controllers: [PunchPointController],
  providers: [PunchPointService],
})
export class PunchPointModule {}
