import { Module } from '@nestjs/common';
import { GeoService } from './geo/geo.service';
import { CommonController } from './common/common.controller';
import { DeviceService } from './device/device.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmployeeDevice } from 'src/database/entities/employee-device.entity';
import { Employee } from 'src/database/entities/employee.entity';
import { DeviceController } from './device/device.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      EmployeeDevice, 
      Employee
    ]),
  ],
  providers: [GeoService, DeviceService],
  controllers: [CommonController, DeviceController],
  exports: [GeoService, DeviceService]
})
export class CommonModule {}
