import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import moment from 'moment';
import { SudaBase } from 'src/database/entities/suda-base.entity';
import { CommonService } from './common.service';
import { AuthGuard } from '@nestjs/passport';
import { UpdateSudaBaseDto } from 'src/database/dto/update-suda-base.dto';

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

    @UseGuards(AuthGuard('jwt'))
    @Post("base/:id")
    async setSystemBase(@Param('id') id: string, @Body() updateDto: UpdateSudaBaseDto): Promise<{ data: SudaBase | null }> {
        return { data: await this.commonService.updateById(id, updateDto.base_value) };
    }
}
