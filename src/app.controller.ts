import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getVersion(): { data: string, message?: string } {
    return { data: this.appService.getVersion(), message: 'suda_punch_api' };
  }
}
