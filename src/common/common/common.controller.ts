import { Controller, Get } from '@nestjs/common';
import moment from 'moment';

@Controller('api/v1/common')
export class CommonController {
    @Get("time")
    getSystemTime(): object {
        const now = new Date();
        return {
            data:{
                server_time: moment(now).utcOffset(process.env.TIME_ZONE || 'Asia/Taipei').format('YYYY-MM-DD HH:mm:ss'),
                time_zone: process.env.TIME_ZONE || 'Asia/Taipei'
            },
            message: '系統時間校準成功',
        };
    }
}
