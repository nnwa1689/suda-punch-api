// src/database/entities/employee-schedule.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, PrimaryColumn } from 'typeorm';
import { ShiftTemplate } from './shift-template.entity'; 
import { Employee } from './employee.entity';

@Entity('employee_schedule')
export class EmployeeSchedule {
  @PrimaryColumn( { type:'uuid' })
  id: string;

  @Column({ type: 'character varying', length: 100 })
  employee_id: string; 

  @Column({ type: 'date' })
  schedule_date: Date; // 排班的日期

  @Column({ type: 'character varying' })
  shift_template_id: string;

  @Column({ type: 'timestamp with time zone', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @Column({ type: 'character varying' })
  schedule_type: string; //fixed (循環) 與 daily (每日排班)。

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