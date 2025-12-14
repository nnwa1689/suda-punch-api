// src/database/entities/employee-schedule.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { ShiftTemplate } from './shift-template.entity'; 
import { Employee } from './employee.entity';

@Entity('employee_schedules')
export class EmployeeSchedule {
  // *** 變動 1：id 改為 UUID 並由 DB 自動產生 ***
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 100 })
  employee_id: string; 

  @Column({ type: 'date' })
  schedule_date: Date; // 排班的日期

  @Column({ type: 'uuid' })
  shift_template_id: string;

  @Column({ type: 'timestamp with time zone', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @Column({ type: 'timestamp with time zone', default: () => 'CURRENT_TIMESTAMP' })
  updated_at: Date;

  // TypeORM 關係定義 
  @ManyToOne(() => Employee)
  @JoinColumn({ name: 'employee_id', referencedColumnName: 'id' })
  employee: Employee;

  @ManyToOne(() => ShiftTemplate, { eager: true }) // eager: true 讓它自動載入 template 資料
  @JoinColumn({ name: 'shift_template_id', referencedColumnName: 'id' })
  template: ShiftTemplate; 
}