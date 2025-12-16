// src/database/entities/shift-template.entity.ts
import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity('shift_templates') // *** 更新表名稱 ***
export class ShiftTemplate {
  @PrimaryColumn({ type: 'uuid' })
  id: string;

  @Column({ length: 50 })
  name: string; // 班別名稱

  // *** 新增欄位 ***
  @Column({ default: false })
  is_cross_day: boolean; // 是否為跨日班 (例如 23:00 - 07:00)

  // *** 拆分的時間欄位 ***
  @Column({ type: 'smallint' }) // 使用 smallint 儲存 0-23
  start_time_h: number; // 應上班時間 (小時)

  @Column({ type: 'smallint' }) // 使用 smallint 儲存 0-59
  start_time_m: number; // 應上班時間 (分鐘)

  @Column({ type: 'smallint' })
  end_time_h: number; // 應下班時間 (小時)

  @Column({ type: 'smallint' })
  end_time_m: number; // 應下班時間 (分鐘)
  
  // 假設寬限期仍然存在於實際的 Shift 記錄中，或在排班邏輯中寫死
  // 這裡暫不添加，沿用之前的設計，在排班記錄中處理

  @Column({ type: 'timestamp with time zone', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @Column({ type: 'timestamp with time zone', default: () => 'CURRENT_TIMESTAMP' })
  updated_at: Date;

  @Column({ type: 'boolean', default: () => true })
  is_active: boolean;
}