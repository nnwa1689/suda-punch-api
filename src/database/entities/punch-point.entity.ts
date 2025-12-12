import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('punch_points')
export class PunchPoint {

    //CREATE TABLE IF NOT EXISTS public.punch_points
// (
//     id character varying(100) COLLATE pg_catalog."default" NOT NULL,
//     name character varying(100) COLLATE pg_catalog."default" NOT NULL,
//     latitude numeric(10,6) NOT NULL,
//     longitude numeric(10,6) NOT NULL,
//     radius_meters numeric(10,0) NOT NULL DEFAULT 10,
//     CONSTRAINT punch_points_pkey PRIMARY KEY (id)
// )

  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 50 })
  name: string; // 地點名稱 (例如：總公司辦公室 A 區)

  @Column({ type: 'numeric', precision: 10, scale: 7 })
  latitude: number; // 中心緯度

  @Column({ type: 'numeric', precision: 10, scale: 7 })
  longitude: number; // 中心經度

  @Column({ type: 'int' })
  radius_meters: number; // 允許打卡的最大半徑 (公尺)

  @Column({ default: true })
  is_active: boolean;

  @Column({ type: 'timestamp with time zone', default: () => 'NOW()' })
  created_at: Date;
}