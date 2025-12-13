import { Controller, Get } from '@nestjs/common';
import moment from 'moment';

@Controller('api/v1/common')
export class CommonController {
    private readonly targetTimeZone = 'Asia/Taipei';
    @Get("time")
    getSystemTime(): object {
        const now = new Date();
        return {
            server_time: moment(now).utcOffset(8).format('YYYY-MM-DD HH:mm:ss'),
            time_zone: this.targetTimeZone,
            message: '系統時間校準成功',
        };
    }
}
