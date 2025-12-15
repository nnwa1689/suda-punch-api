// src/employee/employee.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmployeeController } from './employee/employee.controller';
import { EmployeeService } from './employee/employee.service';
import { Employee } from '../database/entities/employee.entity';
import { ShiftTemplate } from '../database/entities/shift-template.entity'; // 引入
import { EmployeeSchedule } from '../database/entities/employee-schedule.entity'; // 引入
import { EmployeeScheduleController } from './employee-schedule/employee-schedule.controller';
import { EmployeeScheduleService } from './employee-schedule/employee-schedule.service';
import { ShiftTemplateController } from './shift-template/shift-template.controller';
import { ShiftTemplateService } from './shift-template/shift-template.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Employee, 
      ShiftTemplate, 
      EmployeeSchedule // 註冊所有相關 Entity
    ]),
  ],
  controllers: [EmployeeController, EmployeeScheduleController, ShiftTemplateController],
  providers: [EmployeeService, EmployeeScheduleService, ShiftTemplateService],
  exports: [EmployeeService, EmployeeScheduleService], // 確保其他模組可以讀取員工資料
})
export class EmployeeModule {}