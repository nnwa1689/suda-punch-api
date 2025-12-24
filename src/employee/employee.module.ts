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
import { DepartmentsService } from './departments/departments.service';
import { DepartmentsController } from './departments/departments.controller';
import { Department } from 'src/database/entities/department.entity';
import { GeoService } from 'src/common/geo/geo.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Employee, 
      ShiftTemplate, 
      EmployeeSchedule,
      Department // 註冊所有相關 Entity
    ]),
  ],
  controllers: [EmployeeController, EmployeeScheduleController, ShiftTemplateController, DepartmentsController],
  providers: [EmployeeService, EmployeeScheduleService, ShiftTemplateService, DepartmentsService,  GeoService],
  exports: [EmployeeService, EmployeeScheduleService, DepartmentsService], // 確保其他模組可以讀取員工資料
})
export class EmployeeModule {}