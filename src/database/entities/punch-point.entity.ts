import { Entity, PrimaryGeneratedColumn, Column, PrimaryColumn } from 'typeorm';

export enum PunchVerifyType {
  WFH = 'WFH',   // 居家辦公（通常結合 GPS 與 使用者綁定）
  WIFI = 'WIFI', // 辦公室 WiFi 驗證（比對 SSID 或 BSSID）
  GPS = 'GPS',   // 座標地點驗證（比對經緯度與半徑）
}

@Entity('punch_points')
export class PunchPoint {
  @PrimaryColumn()
  id: string;

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

  @Column({
    type: 'enum',
    enum: PunchVerifyType,
    comment: '驗證型態：WFH, WIFI, GPS'
  })
  verify_type: PunchVerifyType;

  @Column({ nullable: true, comment: 'WiFi 的 SSID 名稱' })
  wifi_ssid: string;

  @Column({ nullable: true, comment: 'Bluetooth 的 SerbiceID 名稱' })
  bluetooth_service_uuid: string;

  @Column('text', { array: true, nullable: true, comment: 'BSSID 白名單列表' })
  wifi_bssid_list: string[];

  @Column({ type: 'timestamp with time zone', default: () => 'NOW()' })
  created_at: Date;
}