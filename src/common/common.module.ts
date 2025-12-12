import { Module } from '@nestjs/common';
import { GeoService } from './geo/geo.service';
import { CommonController } from './common/common.controller';
import { DeviceService } from './device/device.service';

@Module({
  providers: [GeoService, DeviceService],
  controllers: [CommonController],
  exports: [GeoService]
})
export class CommonModule {}
