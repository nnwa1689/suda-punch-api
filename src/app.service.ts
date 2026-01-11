import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getVersion(): string {
    return '1.2.4';
  }
}
