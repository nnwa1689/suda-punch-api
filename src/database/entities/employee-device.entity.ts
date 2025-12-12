// src/database/entities/employee-device.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, Unique, ManyToOne, JoinColumn } from 'typeorm';
// 這裡假設您稍後會建立 Employee Entity
// import { Employee } from './employee.entity'; 

@Entity('employee_devices')
@Unique(['employee_id', 'device_uuid']) // 確保同一個員工/裝置 ID 組合唯一
export class EmployeeDevice {

//     CREATE TABLE IF NOT EXISTS public.employee_device
// (
//     id character varying(100) COLLATE pg_catalog."default" NOT NULL,
//     employee_id character varying(100) COLLATE pg_catalog."default" NOT NULL,
//     device_uuid character varying(100) COLLATE pg_catalog."default" NOT NULL,
//     device_type character varying(100) COLLATE pg_catalog."default",
//     is_active boolean NOT NULL DEFAULT true,
//     created_at timestamp with time zone DEFAULT now(),
//     CONSTRAINT checkin_devices_pkey PRIMARY KEY (id)
// )
  @PrimaryGeneratedColumn()
  id: string;

  @Column({ type: 'character' })
  employee_id: string; // 員工 ID

  @Column({ length: 255 })
  device_uuid: string; // 裝置唯一識別碼 (IMEI, IDFV 等)

  @Column({ length: 50 })
  device_type: string; // 裝置類型 (iOS, Android)

  @Column({ default: true })
  is_active: boolean; // 是否為當前啟用中的裝置

  @Column({ type: 'timestamp with time zone', default: () => 'NOW()' })
  created_at : Date;
  
  // 建立與 Employee 表格的關聯 (為簡潔起見，暫時註釋掉實際的 ManyToOne 關係)
  /*
  @ManyToOne(() => Employee)
  @JoinColumn({ name: 'employee_id' })
  employee: Employee;
  */
}