// src/database/entities/employee.entity.ts
import { Entity, PrimaryColumn, Column } from 'typeorm';

@Entity('employees')
export class Employee {
  // *** 變動 1：id 改為 string ***
  @PrimaryColumn({ type: 'varchar', length: 100 })
  id: string; // 員工 ID

  @Column({ length: 100 })
  name: string; // 員工姓名

  // *** 變動 2：新增 department_id ***
  @Column({ type: 'varchar', length: 100 })
  department_id: string; 

  @Column({ default: true })
  is_active: boolean; 

  // *** 變動 3：created_at 改為 TimeWithTimeZone，但 TypeORM 建議使用 Date 物件映射 ***
  // 注意：'time with time zone' 在 TypeORM 中通常仍映射為 Date，但會丟失日期部分
  @Column({ type: 'timestamp with time zone', default: () => 'now()' })
  created_at: Date; 

  @Column({ type: 'timestamp with time zone', default: () => 'CURRENT_TIMESTAMP' })
  updated_at: Date;

  @Column({ type: 'timestamp with time zone', default: () => 'now()' })
  arrival: Date; 
}