import { Module } from '@nestjs/common';
import { GeoService } from './geo/geo.service';
import { CommonController } from './common/common.controller';
import { DeviceService } from './device/device.service';
import { CommonService } from './common/common.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmployeeDevice } from 'src/database/entities/employee-device.entity';
import { Employee } from 'src/database/entities/employee.entity';
import { DeviceController } from './device/device.controller';
import { SudaBase } from 'src/database/entities/suda-base.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      EmployeeDevice, 
      SudaBase,
      Employee,
    ]),
  ],
  providers: [GeoService, DeviceService, CommonService],
  controllers: [CommonController, DeviceController],
  exports: [GeoService, DeviceService, CommonService],
})
export class CommonModule {}
