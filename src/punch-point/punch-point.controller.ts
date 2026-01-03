import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { PunchPointService } from './punch-point.service';
import { CreatePunchPointDto } from '../database/dto/create-punch-point.dto';
import { UpdatePunchPointDto } from '../database/dto/update-punch-point.dto';
import { AuthGuard } from '@nestjs/passport';
import { AdminGuard } from 'src/auth/admin.guard';

@Controller('api/v1/punch-point')
export class PunchPointController {
  constructor(private readonly punchPointService: PunchPointService) {}

  @UseGuards(AuthGuard('jwt'), AdminGuard) 
  @Post()
  async create(@Body() createPunchPointDto: CreatePunchPointDto) {
    return { data: await this.punchPointService.create(createPunchPointDto) };
  }

  @UseGuards(AuthGuard('jwt')) 
  @Get()
  async findAll() {
    return { data: await this.punchPointService.findAll() };
  }

  @UseGuards(AuthGuard('jwt')) 
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return { data: await this.punchPointService.findOne(id) };
  }

  @UseGuards(AuthGuard('jwt'), AdminGuard) 
  @Patch(':id')
  async update(@Param('id') id: string, @Body() updatePunchPointDto: UpdatePunchPointDto) {
    return { data: await this.punchPointService.update(id, updatePunchPointDto) };
  }

  @UseGuards(AuthGuard('jwt'), AdminGuard) 
  @Delete(':id')
  async remove(@Param('id') id: string) {
    return { data: await this.punchPointService.remove(id) };
  }
}
