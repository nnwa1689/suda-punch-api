import { Module } from '@nestjs/common';
import { PunchService } from './punch/punch.service';

@Module({
  providers: [PunchService]
})
export class PunchModule {}
