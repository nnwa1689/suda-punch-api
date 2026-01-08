// src/database/entities/user.entity.ts
import { Entity, PrimaryColumn, Column, OneToOne, JoinColumn } from 'typeorm';

@Entity('suda_base')
export class SudaBase {
  @PrimaryColumn('character varying')
  base_id: string;

  @Column({ type: 'character varying' })
  base_value: string;
}