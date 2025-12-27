import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { PunchPointService } from './punch-point.service';
import { CreatePunchPointDto } from '../database/dto/create-punch-point.dto';
import { UpdatePunchPointDto } from '../database/dto/update-punch-point.dto';

@Controller('api/v1/punch-point')
export class PunchPointController {
  constructor(private readonly punchPointService: PunchPointService) {}

  @Post()
  async create(@Body() createPunchPointDto: CreatePunchPointDto) {
    return { data: await this.punchPointService.create(createPunchPointDto) };
  }

  @Get()
  async findAll() {
    return { data: await this.punchPointService.findAll() };
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return { data: await this.punchPointService.findOne(id) };
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updatePunchPointDto: UpdatePunchPointDto) {
    return { data: await this.punchPointService.update(id, updatePunchPointDto) };
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return { data: await this.punchPointService.remove(id) };
  }
}
