import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import moment from 'moment';
import { SudaBase } from 'src/database/entities/suda-base.entity';
import { CommonService } from './common.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('api/v1/common')
export class CommonController {
    constructor(private readonly commonService: CommonService) {}
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

    @UseGuards(AuthGuard('jwt'))
    @Get("base/:id")
    async getSystemBase(@Param('id') id: string): Promise<{ data: SudaBase | null }> {
        return { data: await this.commonService.findById(id) };
    }
}
