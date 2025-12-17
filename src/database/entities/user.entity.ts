// src/database/entities/user.entity.ts
import { Entity, PrimaryColumn, Column, OneToOne, JoinColumn } from 'typeorm';
import { Employee } from './employee.entity';

@Entity('users')
export class User {
  @PrimaryColumn('uuid')
  id: string;

  @Column({ unique: true })
  username: string;

  @Column({ select: false }) // 查詢時預設不顯示密碼，增加安全性
  password: string;

  @Column({ default: true })
  is_active: boolean;

  // 關聯到員工表
  @OneToOne(() => Employee)
  @JoinColumn({ name: 'employee_id' })
  employee: Employee;

  @Column({ nullable: false })
  employee_id: string;
}