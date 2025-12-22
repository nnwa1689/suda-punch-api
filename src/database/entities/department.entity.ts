// src/departments/entities/department.entity.ts
import { Entity, Column, OneToMany, PrimaryColumn } from 'typeorm';
import { Employee } from '../entities/employee.entity'; // 引入 Employee

@Entity('departments')
export class Department {
  @PrimaryColumn()
  id: string;

  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column({ type: 'varchar', length: 100 })
  parent_department_id: string;

  @Column({ type: 'boolean', default: true })
  is_active: boolean;

  // 關聯設定：一個部門對應多個員工
  @OneToMany(() => Employee, (employee) => employee.department)
  employees: Employee[];
}