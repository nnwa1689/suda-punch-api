// src/database/entities/punch-log.entity.ts
import { Entity, PrimaryColumn, Column, Index, OneToOne, JoinColumn } from 'typeorm';
import { Employee } from './employee.entity';
import { PunchPoint } from './punch-point.entity';

@Entity('punch_logs')
@Index(['employee_id', 'punch_time']) // 加快按員工和時間查詢
export class PunchLog {
//   CREATE TABLE IF NOT EXISTS public.punch_logs
// (
//     employee_id character varying(100) COLLATE pg_catalog."default" NOT NULL,
//     punch_time timestamp with time zone NOT NULL,
//     punch_points_id character varying(100) COLLATE pg_catalog."default" NOT NULL,
//     recorded_lat numeric(10,6) NOT NULL,
//     recorded_lng numeric(10,6) NOT NULL,
//     id uuid NOT NULL,
//     CONSTRAINT punch_logs_pkey PRIMARY KEY (id)
// )
  @PrimaryColumn({ type: 'uuid' })
  id: string;

  @Column({ type: 'character' })
  employee_id: string;

  @Column({ type: 'timestamp with time zone' })
  punch_time: Date; // 打卡當下的時間 (UTC 或伺服器時間)

  @Column({ type: 'numeric', precision: 10, scale: 7 })
  recorded_lat: number; // 打卡時記錄的緯度

  @Column({ type: 'numeric', precision: 10, scale: 7 })
  recorded_lng: number; // 打卡時記錄的經度
  
  @Column({ type: 'character' })
  punch_points_id: string; // 對應哪個打卡點 (用於多地點判斷)
  
  @Column({ type: 'character', length: 50, nullable: true })
  punch_type: string | null; // 例如：'CHECK_IN', 'CHECK_OUT'

  @Column({ type: 'boolean', default: false })
  is_late: boolean;

  @Column({ type: 'boolean', default: false })
  is_early: boolean;
 
  @Column({ type: 'character', nullable: true })
  remark: string;

  // 關聯到員工表
  @OneToOne(() => Employee)
  @JoinColumn({ name: 'employee_id' })
  employee: Employee;

  // 關聯到 pucnh point 表
  @OneToOne(() => PunchPoint)
  @JoinColumn({ name: 'punch_points_id' })
  punchPoint: PunchPoint;
}