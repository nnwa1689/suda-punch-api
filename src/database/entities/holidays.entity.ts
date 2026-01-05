import { Entity, PrimaryColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';
import { v4 as uuidv4 } from 'uuid'; // 需要安裝：npm install uuid

@Entity('holidays')
export class Holiday {
  @PrimaryColumn({ type: 'uuid' }) // 禁止 null 的主鍵
  id: string;

  @Index({ unique: true })
  @Column({ type: 'date' })
  date: string;

  @Column()
  subject: string;

  @Column({ type: 'boolean', default: true })
  is_holiday: boolean;

  @Column({ type: 'text', nullable: true })
  description: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // 在存入資料庫前，如果 id 為空則自動產生
  constructor() {
    if (!this.id) {
      this.id = uuidv4();
    }
  }
}