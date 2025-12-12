import { Module } from '@nestjs/common';
import { GeoService } from './geo/geo.service';
import { CommonController } from './common/common.controller';
import { DeviceService } from './device/device.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmployeeDevice } from 'src/database/entities/employee-device.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([EmployeeDevice]),
  ],
  providers: [GeoService, DeviceService],
  controllers: [CommonController],
  exports: [GeoService, DeviceService]
})
export class CommonModule {}
