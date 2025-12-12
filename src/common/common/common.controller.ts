import { Controller, Get } from '@nestjs/common';
import { formatInTimeZone } from 'date-fns-tz';

@Controller('api/common')
export class CommonController {
    private readonly targetTimeZone = 'Asia/Taipei';

    @Get("v1/time")
    getSystemTime(): object {
        const now = new Date();
        // 格式化為 ISO 8601 格式，並指定時區
        const timeUtcPlus8 = formatInTimeZone(
            now, 
            this.targetTimeZone, 
            // 輸出格式：'yyyy-MM-dd’T’HH:mm:ss.SSSXXX' (ISO 8601 帶時區偏移)
            "yyyy-MM-dd'T'HH:mm:ss.SSSXXX" 
        );

        return {
            server_time: timeUtcPlus8,
            time_zone: this.targetTimeZone,
            message: '系統時間校準成功',
        };
    }
}
