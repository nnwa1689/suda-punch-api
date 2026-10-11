// test/backstage.e2e-spec.ts
// 後台功能 e2e 測試：班別設定、個別排班、批次排班、打卡紀錄調整、打卡點設定
// 需連線實際資料庫，並以管理員帳號登入：
//   NODE_ENV=development E2E_USERNAME=xxx E2E_PASSWORD=xxx npm run test:e2e -- backstage
// 測試資料皆以 E2E 前綴建立，結束後自動清除
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { DataSource, In } from 'typeorm';
import moment from 'moment';
import { randomUUID } from 'crypto';
import { AppModule } from './../src/app.module';
import { ResponseInterceptor } from './../src/common/response.interceptor';
import { Department } from './../src/database/entities/department.entity';
import { Employee } from './../src/database/entities/employee.entity';
import { EmployeeSchedule } from './../src/database/entities/employee-schedule.entity';
import { PunchLog } from './../src/database/entities/punch-log.entity';
import { ShiftTemplate } from './../src/database/entities/shift-template.entity';
import { PunchPoint } from './../src/database/entities/punch-point.entity';
import { Holiday } from './../src/database/entities/holidays.entity';

const USERNAME = process.env.E2E_USERNAME;
const PASSWORD = process.env.E2E_PASSWORD;

// 測試資料代碼 (避免與既有資料衝突)
const TAG = `E2E${Date.now().toString(36).toUpperCase()}`;
const DEPT_A = `${TAG}_DA`;
const DEPT_B = `${TAG}_DB`;
const EMP_1 = `${TAG}_E1`;
const EMP_2 = `${TAG}_E2`;
const EMP_INACTIVE = `${TAG}_E3`;
const TPL_DAY = `${TAG}_DAY`;
const TPL_NIGHT = `${TAG}_NGT`;
const POINT = `${TAG}_PP`;
const POINT_BT = `${TAG}_BT`;
const TPL_ALLDAY = `${TAG}_ALL`; // 00:00 - 23:59，非例假日打卡一定遲到
const HOLIDAY_DATE = '2099-01-20';
const EMP_PASSWORD = 'e2e-pass-123';
const DEVICE_UUID = `${TAG}-DEVICE`;
const MONTH = '2099-01'; // 遠期月份，避免影響實際排班

describe('後台功能 (e2e)', () => {
  let app: INestApplication<App>;
  let dataSource: DataSource;
  let token: string;
  // 員工2 的登入 token (例假日打卡與裝置綁定測試共用)
  let employeeToken: string;
  // 測試中自行建立的例假日 (結束時刪除；既有的例假日不動)
  const insertedHolidayDates: string[] = [];

  const api = () => request(app.getHttpServer());
  const auth = (req: request.Test) => req.set('Authorization', `Bearer ${token}`);

  beforeAll(async () => {
    if (!USERNAME || !PASSWORD) {
      throw new Error('請設定 E2E_USERNAME 與 E2E_PASSWORD 環境變數 (需為管理員帳號)');
    }

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    // 與 main.ts 相同的全域設定
    app.useGlobalInterceptors(new ResponseInterceptor());
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }));
    await app.init();
    dataSource = app.get(DataSource);

    const login = await api().post('/api/v1/auth/login').send({ username: USERNAME, password: PASSWORD });
    expect(login.status).toBeLessThan(300);
    token = login.body.data.access_token;
    expect(token).toBeTruthy();

    // 建立測試用部門與員工
    await dataSource.getRepository(Department).save([
      { id: DEPT_A, name: `${TAG} 部門A`, parent_department_id: '000', is_active: true },
      { id: DEPT_B, name: `${TAG} 部門B`, parent_department_id: '000', is_active: true },
    ]);
    await dataSource.getRepository(Employee).save([
      { id: EMP_1, name: `${TAG} 員工1`, department_id: DEPT_A, is_active: true },
      { id: EMP_2, name: `${TAG} 員工2`, department_id: DEPT_B, is_active: true },
      { id: EMP_INACTIVE, name: `${TAG} 員工3`, department_id: DEPT_A, is_active: false },
    ]);
  });

  afterAll(async () => {
    if (dataSource?.isInitialized) {
      const employeeIds = [EMP_1, EMP_2, EMP_INACTIVE];
      await dataSource.getRepository(PunchLog).delete({ employee_id: In(employeeIds) });
      await dataSource.query('DELETE FROM employee_device WHERE employee_id = ANY($1)', [employeeIds]);
      await dataSource.query('DELETE FROM users WHERE employee_id = ANY($1)', [employeeIds]);
      if (insertedHolidayDates.length) {
        await dataSource.getRepository(Holiday).delete({ date: In(insertedHolidayDates) });
      }
      await dataSource.getRepository(EmployeeSchedule).delete({ employee_id: In(employeeIds) });
      await dataSource.getRepository(Employee).delete({ id: In(employeeIds) });
      await dataSource.getRepository(Department).delete({ id: In([DEPT_A, DEPT_B]) });
      await dataSource.getRepository(ShiftTemplate).delete({ id: In([TPL_DAY, TPL_NIGHT, TPL_ALLDAY]) });
      await dataSource.getRepository(PunchPoint).delete({ id: In([POINT, POINT_BT]) });
    }
    await app?.close();
  });

  const countSchedules = () =>
    dataSource.getRepository(EmployeeSchedule).count({ where: { employee_id: In([EMP_1, EMP_2, EMP_INACTIVE]) } });

  describe('班別設定 /api/v1/shift/template', () => {
    it('未登入不可存取', async () => {
      await api().get('/api/v1/shift/template').expect(401);
    });

    it('新增班別，系統寫入建立與更新時間', async () => {
      const before = Date.now();
      const res = await auth(api().post('/api/v1/shift/template')).send({
        id: TPL_DAY, name: '日班', isCrossDay: false,
        startTimeH: 9, startTimeM: 0, endTimeH: 18, endTimeM: 0,
      }).expect(201);

      expect(res.body.success).toBe(true);
      expect(res.body.data).toMatchObject({ id: TPL_DAY, name: '日班', start_time_h: 9, end_time_h: 18, is_active: true });
      const createdAt = new Date(res.body.data.created_at).getTime();
      expect(createdAt).toBeGreaterThanOrEqual(before - 5000);
      expect(res.body.data.updated_at).toBe(res.body.data.created_at);

      await auth(api().post('/api/v1/shift/template')).send({
        id: TPL_NIGHT, name: '夜班', isCrossDay: true,
        startTimeH: 22, startTimeM: 0, endTimeH: 6, endTimeM: 0,
      }).expect(201);
    });

    it('班別代碼重複時拒絕新增', async () => {
      await auth(api().post('/api/v1/shift/template')).send({
        id: TPL_DAY, name: '重複', startTimeH: 9, startTimeM: 0, endTimeH: 18, endTimeM: 0,
      }).expect(400);
    });

    it('時間超出範圍時拒絕新增', async () => {
      await auth(api().post('/api/v1/shift/template')).send({
        id: `${TAG}_BAD`, name: '錯誤', startTimeH: 24, startTimeM: 0, endTimeH: 18, endTimeM: 60,
      }).expect(400);
    });

    it('更新班別並刷新更新時間', async () => {
      const original = await dataSource.getRepository(ShiftTemplate).findOneByOrFail({ id: TPL_DAY });
      await new Promise((r) => setTimeout(r, 20));

      const res = await auth(api().patch(`/api/v1/shift/template/${TPL_DAY}`))
        .send({ name: '日班(改)', startTimeM: 30 })
        .expect(200);

      expect(res.body.data).toMatchObject({ name: '日班(改)', start_time_h: 9, start_time_m: 30 });
      expect(new Date(res.body.data.updated_at).getTime()).toBeGreaterThan(original.updated_at.getTime());
      expect(new Date(res.body.data.created_at).getTime()).toBe(original.created_at.getTime());

      // 還原為 09:00，供後續遲到判斷使用
      await auth(api().patch(`/api/v1/shift/template/${TPL_DAY}`)).send({ startTimeM: 0 }).expect(200);
    });

    it('更新時不可修改班別代碼', async () => {
      await auth(api().patch(`/api/v1/shift/template/${TPL_DAY}`)).send({ id: 'OTHER' }).expect(400);
    });

    it('列表包含新增的班別', async () => {
      const res = await auth(api().get('/api/v1/shift/template')).expect(200);
      const ids = res.body.data.map((t: ShiftTemplate) => t.id);
      expect(ids).toEqual(expect.arrayContaining([TPL_DAY, TPL_NIGHT]));
    });
  });

  describe('打卡點設定 /api/v1/punch-point', () => {
    it('新增打卡點', async () => {
      const res = await auth(api().post('/api/v1/punch-point')).send({
        id: POINT, name: `${TAG} 總公司`, latitude: 25.033964, longitude: 121.564468,
        radiusMeters: 150, verifyType: 'GPS',
      }).expect(201);
      expect(res.body.data).toMatchObject({ id: POINT, verify_type: 'GPS', is_active: true });
    });

    it('依關鍵字列出打卡點', async () => {
      const res = await auth(api().get('/api/v1/punch-point').query({ q: TAG })).expect(200);
      expect(res.body.data).toHaveLength(1);
      expect(res.body.data[0].id).toBe(POINT);
    });

    it('更新打卡點設定', async () => {
      const res = await auth(api().patch(`/api/v1/punch-point/${POINT}`)).send({
        name: `${TAG} 總公司(改)`, radiusMeters: 300, verifyType: 'WIFI',
        wifiSsid: 'SUDA-OFFICE', wifiBssidList: ['aa:bb:cc:dd:ee:ff'],
      }).expect(200);
      expect(res.body.data).toMatchObject({
        name: `${TAG} 總公司(改)`, verify_type: 'WIFI', wifi_ssid: 'SUDA-OFFICE', wifi_bssid_list: ['aa:bb:cc:dd:ee:ff'],
      });
      expect(Number(res.body.data.radius_meters)).toBe(300);
      // 部分更新：未傳入的座標應保留原值
      expect(Number(res.body.data.latitude)).toBeCloseTo(25.033964, 5);
      expect(Number(res.body.data.longitude)).toBeCloseTo(121.564468, 5);
    });

    it('藍牙類型必須設定格式正確的 Service UUID', async () => {
      const base = { id: POINT_BT, name: `${TAG} 藍牙`, latitude: 25.03, longitude: 121.56, verifyType: 'Bluetooth' };
      const missing = await auth(api().post('/api/v1/punch-point')).send(base).expect(400);
      expect(missing.body.message).toContain('必須設定藍牙 Service UUID');

      for (const bad of ['not-a-uuid', '180', 'ZZZZ', '12345678-1234-1234-1234-12345678']) {
        await auth(api().post('/api/v1/punch-point')).send({ ...base, bluetoothServiceUuid: bad }).expect(400);
      }
    });

    it('新增藍牙打卡點，並可切換為 GPS 後清除 UUID', async () => {
      const uuid = 'E2C56DB5-DFFB-48D2-B060-D0F5A71096E0';
      const created = await auth(api().post('/api/v1/punch-point')).send({
        id: POINT_BT, name: `${TAG} 藍牙`, latitude: 25.03, longitude: 121.56, verifyType: 'Bluetooth', bluetoothServiceUuid: uuid,
      }).expect(201);
      expect(created.body.data).toMatchObject({ verify_type: 'Bluetooth', bluetooth_service_uuid: uuid });

      // 16-bit 短 UUID 也可接受
      const short = await auth(api().patch(`/api/v1/punch-point/${POINT_BT}`)).send({ bluetoothServiceUuid: '180D' }).expect(200);
      expect(short.body.data.bluetooth_service_uuid).toBe('180D');

      // 部分更新其他欄位時保留 UUID
      const renamed = await auth(api().patch(`/api/v1/punch-point/${POINT_BT}`)).send({ name: `${TAG} 藍牙(改)` }).expect(200);
      expect(renamed.body.data).toMatchObject({ verify_type: 'Bluetooth', bluetooth_service_uuid: '180D' });

      // 切換為 GPS 並清除 UUID
      const gps = await auth(api().patch(`/api/v1/punch-point/${POINT_BT}`)).send({ verifyType: 'GPS', bluetoothServiceUuid: '' }).expect(200);
      expect(gps.body.data).toMatchObject({ verify_type: 'GPS', bluetooth_service_uuid: null });

      // 改回藍牙但未提供 UUID → 拒絕
      await auth(api().patch(`/api/v1/punch-point/${POINT_BT}`)).send({ verifyType: 'Bluetooth' }).expect(400);
    });

    it('刪除為軟刪除：切換停用/啟用', async () => {
      const off = await auth(api().delete(`/api/v1/punch-point/${POINT}`)).expect(200);
      expect(off.body.data.is_active).toBe(false);
      const on = await auth(api().delete(`/api/v1/punch-point/${POINT}`)).expect(200);
      expect(on.body.data.is_active).toBe(true);
    });
  });

  describe('個別排班 /api/v1/schedule', () => {
    let scheduleId: string;

    it('新增每日排班', async () => {
      const res = await auth(api().post('/api/v1/schedule')).send({
        employeeId: EMP_1, scheduleDate: `${MONTH}-10`, shiftTemplateId: TPL_DAY, scheduleType: 'daily',
      }).expect(201);
      scheduleId = res.body.data.id;
      expect(scheduleId).toBeTruthy();
    });

    it('依員工與日期區間查詢', async () => {
      const res = await auth(api().get('/api/v1/schedule'))
        .query({ employeeId: EMP_1, startDate: `${MONTH}-01`, endDate: `${MONTH}-31`, limit: 100 })
        .expect(200);
      expect(res.body.data).toHaveLength(1);
      expect(res.body.data[0]).toMatchObject({ id: scheduleId, employee_id: EMP_1, schedule_date: `${MONTH}-10` });
      expect(res.body.data[0].template.id).toBe(TPL_DAY);

      const other = await auth(api().get('/api/v1/schedule'))
        .query({ employeeId: EMP_2, startDate: `${MONTH}-01`, endDate: `${MONTH}-31` })
        .expect(200);
      expect(other.body.data).toHaveLength(0);
    });

    it('更新排班', async () => {
      const res = await auth(api().patch(`/api/v1/schedule/${scheduleId}`)).send({
        employeeId: EMP_1, scheduleDate: `${MONTH}-11`, shiftTemplateId: TPL_NIGHT, scheduleType: 'daily',
      }).expect(200);
      expect(res.body.data).toMatchObject({ schedule_date: `${MONTH}-11`, shift_template_id: TPL_NIGHT });
    });

    it('刪除排班', async () => {
      await auth(api().delete(`/api/v1/schedule/${scheduleId}`)).expect(204);
      await auth(api().get(`/api/v1/schedule/${scheduleId}`)).expect(404);
    });
  });

  describe('批次排班 /api/v1/schedule/batch (月曆式)', () => {
    // 產生 days 陣列：指定日 (1 起算) 填入班別代碼
    const days = (entries: Record<number, string>, length = 31) =>
      Array.from({ length }, (_, i) => entries[i + 1] ?? '');

    it('資料不存在時整批拒絕匯入並列出所有錯誤', async () => {
      const before = await countSchedules();
      const res = await auth(api().post('/api/v1/schedule/batch')).send({
        month: MONTH,
        rows: [
          { departmentId: DEPT_A, employeeId: EMP_1, cyclicShiftTemplateId: TPL_DAY, days: [] }, // 正確
          { departmentId: 'NO_DEPT', employeeId: EMP_2, days: days({ 1: TPL_DAY }) },
          { departmentId: DEPT_A, employeeId: 'NO_EMP', days: days({ 1: TPL_DAY }) },
          { departmentId: DEPT_A, employeeId: EMP_INACTIVE, cyclicShiftTemplateId: 'NO_TPL', days: [] },
          { departmentId: DEPT_A, employeeId: EMP_2, days: days({ 3: TPL_DAY }) }, // 重複且部門不符
        ],
      }).expect(400);

      expect(res.body.message).toContain('整批未匯入');
      const errors: string[] = res.body.errors;
      expect(errors).toEqual(expect.arrayContaining([
        '第 2 筆：部門 NO_DEPT 不存在。',
        '第 3 筆：員工編號 NO_EMP 不存在。',
        `第 4 筆：員工 ${EMP_INACTIVE} 已停用。`,
        '第 4 筆：循環班別代碼 NO_TPL 不存在。',
        `第 5 筆：員工 ${EMP_2} 不屬於部門 ${DEPT_A}。`,
        `第 5 筆：員工 ${EMP_2} 在匯入檔案中重複，每位員工僅能一列。`,
      ]));
      expect(errors.some((e) => e.startsWith('第 1 筆'))).toBe(false);
      expect(await countSchedules()).toBe(before);
    });

    it('逐日班別錯誤：代碼不存在、超出當月天數、未指定任何班別', async () => {
      const before = await countSchedules();
      const res = await auth(api().post('/api/v1/schedule/batch')).send({
        month: '2099-02', // 28 天
        rows: [
          { departmentId: DEPT_A, employeeId: EMP_1, days: days({ 1: TPL_DAY, 2: 'NO_TPL', 30: TPL_DAY }) },
          { departmentId: DEPT_B, employeeId: EMP_2, days: days({}) },
        ],
      }).expect(400);
      expect(res.body.errors).toEqual([
        '第 1 筆：2 日班別代碼 NO_TPL 不存在。',
        '第 1 筆：2099-02 只有 28 天，30 日不可填寫班別。',
        `第 2 筆：員工 ${EMP_2} 未指定任何班別。`,
      ]);
      expect(await countSchedules()).toBe(before);
    });

    it('月份格式錯誤或超過 31 日時拒絕', async () => {
      await auth(api().post('/api/v1/schedule/batch')).send({
        month: '2099-13',
        rows: [{ departmentId: DEPT_A, employeeId: EMP_1, cyclicShiftTemplateId: TPL_DAY, days: [] }],
      }).expect(400);
      await auth(api().post('/api/v1/schedule/batch')).send({
        month: MONTH,
        rows: [{ departmentId: DEPT_A, employeeId: EMP_1, days: days({ 1: TPL_DAY }, 32) }],
      }).expect(400);
    });

    it('驗證通過時匯入：循環班別一筆、逐日班別每天一筆，逐日可覆寫循環', async () => {
      const res = await auth(api().post('/api/v1/schedule/batch')).send({
        month: MONTH,
        rows: [
          // 部門可填名稱；整月日班，5 日改夜班
          { departmentId: `${TAG} 部門A`, employeeId: EMP_1, cyclicShiftTemplateId: TPL_DAY, days: days({ 5: TPL_NIGHT }) },
          // 逐日排班，3 日休假
          { departmentId: DEPT_B, employeeId: EMP_2, days: days({ 1: TPL_DAY, 2: TPL_NIGHT, 4: TPL_DAY }) },
        ],
      }).expect(201);
      expect(res.body.data).toEqual({ rowCount: 2, scheduleCount: 5 });
      expect(res.body.message).toBe('成功匯入 2 位員工，共 5 筆排班。');

      const repo = dataSource.getRepository(EmployeeSchedule);
      const summary = async (employeeId: string) =>
        (await repo.find({ where: { employee_id: employeeId }, order: { schedule_date: 'ASC' } })).map(
          (s) => `${moment(s.schedule_date).format('YYYY-MM-DD')} ${s.schedule_type} ${s.shift_template_id}`,
        );
      expect(await summary(EMP_1)).toEqual([
        `${MONTH}-01 fixed ${TPL_DAY}`,
        `${MONTH}-05 daily ${TPL_NIGHT}`,
      ]);
      expect(await summary(EMP_2)).toEqual([
        `${MONTH}-01 daily ${TPL_DAY}`,
        `${MONTH}-02 daily ${TPL_NIGHT}`,
        `${MONTH}-04 daily ${TPL_DAY}`,
      ]);
    });

    it('與既有排班衝突時整批拒絕', async () => {
      const before = await countSchedules();
      const res = await auth(api().post('/api/v1/schedule/batch')).send({
        month: MONTH,
        rows: [
          { departmentId: DEPT_A, employeeId: EMP_1, cyclicShiftTemplateId: TPL_NIGHT, days: [] },
          { departmentId: DEPT_B, employeeId: EMP_2, days: days({ 2: TPL_DAY, 3: TPL_DAY, 4: TPL_NIGHT }) },
        ],
      }).expect(400);
      expect(res.body.errors).toEqual([
        `第 1 筆：員工 ${EMP_1} 在 ${MONTH} 月份已有循環班別排班。`,
        `第 2 筆：員工 ${EMP_2} 在 2、4 日已有排班。`,
      ]);
      expect(await countSchedules()).toBe(before);
    });
  });

  describe('打卡紀錄調整 /api/v1/punch/records', () => {
    let recordId: string;
    // EMP_1 於 MONTH 為 TPL_DAY (09:00-18:00) 循環班別
    const at = (day: number, h: number, m: number) => new Date(2099, 0, day, h, m, 0).toISOString();

    it('欄位驗證：打卡類別錯誤或缺少必填欄位', async () => {
      await auth(api().post('/api/v1/punch/records')).send({
        employeeId: EMP_1, punchTime: at(15, 9, 0), punchPointsId: POINT, punchType: 'LUNCH',
      }).expect(400);
      await auth(api().post('/api/v1/punch/records')).send({ employeeId: EMP_1 }).expect(400);
    });

    it('員工或打卡點不存在時回傳 404', async () => {
      await auth(api().post('/api/v1/punch/records')).send({
        employeeId: 'NO_EMP', punchTime: at(15, 9, 0), punchPointsId: POINT, punchType: 'CHECK_IN',
      }).expect(404);
      await auth(api().post('/api/v1/punch/records')).send({
        employeeId: EMP_1, punchTime: at(15, 9, 0), punchPointsId: 'NO_POINT', punchType: 'CHECK_IN',
      }).expect(404);
    });

    it('新增 (補登) 紀錄並依排班自動判斷遲到，座標預設為打卡點', async () => {
      const res = await auth(api().post('/api/v1/punch/records')).send({
        employeeId: EMP_1, punchTime: at(15, 9, 30), punchPointsId: POINT, punchType: 'CHECK_IN', remark: '忘記打卡補登',
      }).expect(201);

      recordId = res.body.data.id;
      expect(res.body.data).toMatchObject({
        employee_id: EMP_1, punch_points_id: POINT, punch_type: 'CHECK_IN', is_late: true, is_early: false, remark: '忘記打卡補登',
      });
      expect(new Date(res.body.data.punch_time).toISOString()).toBe(at(15, 9, 30));
      expect(Number(res.body.data.recorded_lat)).toBeCloseTo(25.033964, 5);
      expect(Number(res.body.data.recorded_lng)).toBeCloseTo(121.564468, 5);
    });

    it('可手動指定遲到狀態', async () => {
      const res = await auth(api().patch(`/api/v1/punch/records/${recordId}`)).send({ isLate: false }).expect(200);
      expect(res.body.data.is_late).toBe(false);
    });

    it('更新時間與類別時重新依排班判斷早退', async () => {
      const res = await auth(api().patch(`/api/v1/punch/records/${recordId}`)).send({
        punchTime: at(15, 17, 0), punchType: 'CHECK_OUT',
      }).expect(200);
      expect(res.body.data).toMatchObject({ punch_type: 'CHECK_OUT', is_late: false, is_early: true });
      expect(res.body.data.remark).toBe('忘記打卡補登');
    });

    it('後台列表可查到紀錄並含打卡點資訊', async () => {
      const res = await auth(api().post('/api/v1/punch/all-records')).send({
        startDate: `${MONTH}-01`, endDate: `${MONTH}-31`, employeeId: EMP_1,
      }).expect(201);
      expect(res.body.data).toHaveLength(1);
      expect(res.body.data[0].punchPoint.id).toBe(POINT);
    });

    it('刪除紀錄', async () => {
      const res = await auth(api().delete(`/api/v1/punch/records/${recordId}`)).expect(200);
      expect(res.body.data).toEqual({ id: recordId });
      await auth(api().patch(`/api/v1/punch/records/${recordId}`)).send({ remark: 'x' }).expect(404);
      await auth(api().delete(`/api/v1/punch/records/${recordId}`)).expect(404);
    });

    it('例假日補登不計遲到，並寫入例假日備註', async () => {
      await dataSource.getRepository(Holiday).save({ id: randomUUID(), date: HOLIDAY_DATE, subject: `${TAG}測試假日`, is_holiday: true });
      insertedHolidayDates.push(HOLIDAY_DATE);

      // 員工1 該月為 09:00 - 18:00 循環班別，09:30 上班卡在平日會判定遲到
      const res = await auth(api().post('/api/v1/punch/records')).send({
        employeeId: EMP_1, punchTime: at(20, 9, 30), punchPointsId: POINT, punchType: 'CHECK_IN',
      }).expect(201);
      expect(res.body.data).toMatchObject({ is_late: false, is_early: false });
      expect(res.body.data.remark).toContain(`例假日(${TAG}測試假日)`);

      // 改為 17:00 下班卡，依然不計早退
      const updated = await auth(api().patch(`/api/v1/punch/records/${res.body.data.id}`)).send({
        punchTime: at(20, 17, 0), punchType: 'CHECK_OUT',
      }).expect(200);
      expect(updated.body.data).toMatchObject({ is_late: false, is_early: false });
    });
  });

  describe('員工打卡 POST /api/v1/punch (例假日)', () => {
    const today = moment().format('YYYY-MM-DD');
    let holidaySubject: string | undefined;

    beforeAll(async () => {
      // 今日若非例假日則建立測試用例假日；若今日標記為補班 (is_holiday = false) 則略過此組測試
      const existing = await dataSource.getRepository(Holiday).findOne({ where: { date: today } });
      if (!existing) {
        await dataSource.getRepository(Holiday).save({ id: randomUUID(), date: today, subject: `${TAG}測試假日`, is_holiday: true });
        insertedHolidayDates.push(today);
        holidaySubject = `${TAG}測試假日`;
      } else if (existing.is_holiday) {
        holidaySubject = existing.subject;
      }

      // 打卡點改回 GPS 驗證
      await auth(api().patch(`/api/v1/punch-point/${POINT}`)).send({ verifyType: 'GPS', radiusMeters: 300 }).expect(200);
      // 今日排 00:00 - 23:59 的班
      await dataSource.getRepository(ShiftTemplate).save({
        id: TPL_ALLDAY, name: '全日班', is_cross_day: false,
        start_time_h: 0, start_time_m: 0, end_time_h: 23, end_time_m: 59, is_active: true,
      });
      await auth(api().post('/api/v1/schedule')).send({
        employeeId: EMP_2, scheduleDate: today, shiftTemplateId: TPL_ALLDAY, scheduleType: 'daily',
      }).expect(201);
      // 建立員工帳號，以員工身分登入後綁定自己的裝置 (與 iOS 流程相同)
      await auth(api().post('/api/v1/users/register')).send({ username: EMP_2, password: EMP_PASSWORD, employeeId: EMP_2 }).expect(201);
      const login = await api().post('/api/v1/auth/login').send({ username: EMP_2, password: EMP_PASSWORD });
      employeeToken = login.body.data.access_token;
      await api().post('/api/v1/device/bind').set('Authorization', `Bearer ${employeeToken}`)
        .send({ employeeId: EMP_2, deviceUuid: DEVICE_UUID, deviceType: 'ios' }).expect(201);
    });

    it('例假日上班打卡不計遲到', async () => {
      if (!holidaySubject) return; // 今日為補班日，無法驗證
      const res = await api().post('/api/v1/punch').set('Authorization', `Bearer ${employeeToken}`).send({
        latitude: 25.033964, longitude: 121.564468, deviceUuid: DEVICE_UUID, type: 'CHECK_IN', punchPointsId: POINT,
      }).expect(200);
      expect(res.body.data.remark).toBe(`例假日(${holidaySubject})打卡，不計遲到早退。`);

      const log = await dataSource.getRepository(PunchLog).findOneByOrFail({ id: res.body.data.punch_id });
      expect(log).toMatchObject({ employee_id: EMP_2, punch_type: 'CHECK_IN', is_late: false, is_early: false });
    });

    it('例假日下班打卡不計早退', async () => {
      if (!holidaySubject) return;
      const res = await api().post('/api/v1/punch').set('Authorization', `Bearer ${employeeToken}`).send({
        latitude: 25.033964, longitude: 121.564468, deviceUuid: DEVICE_UUID, type: 'CHECK_OUT', punchPointsId: POINT,
      }).expect(200);
      const log = await dataSource.getRepository(PunchLog).findOneByOrFail({ id: res.body.data.punch_id });
      expect(log).toMatchObject({ punch_type: 'CHECK_OUT', is_late: false, is_early: false });
    });

    it('非法的打卡類別在寫入前即拒絕', async () => {
      await api().post('/api/v1/punch').set('Authorization', `Bearer ${employeeToken}`).send({
        latitude: 25.033964, longitude: 121.564468, deviceUuid: DEVICE_UUID, type: 'LUNCH', punchPointsId: POINT,
      }).expect(400);
    });
  });

  describe('裝置綁定 /api/v1/device', () => {
    const E1_DEVICE = `${TAG}-E1-DEVICE`;
    const asEmployee = (req: request.Test) => req.set('Authorization', `Bearer ${employeeToken}`);
    const activeDevice = (employeeId: string) =>
      dataSource.query('SELECT device_uuid FROM employee_device WHERE employee_id = $1 AND is_active = true', [employeeId]);

    beforeAll(async () => {
      // 員工1 的既有綁定 (直接寫入資料庫)
      await dataSource.query(
        `INSERT INTO employee_device (id, employee_id, device_uuid, device_type, is_active) VALUES ($1, $2, $3, 'ios', true)`,
        [randomUUID(), EMP_1, E1_DEVICE],
      );
    });

    it('員工不可為其他員工綁定裝置', async () => {
      await asEmployee(api().post('/api/v1/device/bind'))
        .send({ employeeId: EMP_INACTIVE, deviceUuid: `${TAG}-X`, deviceType: 'ios' }).expect(403);
      expect(await activeDevice(EMP_INACTIVE)).toHaveLength(0);
    });

    it('管理員也不可替其他員工綁定裝置', async () => {
      await auth(api().post('/api/v1/device/bind'))
        .send({ employeeId: EMP_INACTIVE, deviceUuid: `${TAG}-X`, deviceType: 'ios' }).expect(403);
    });

    it('員工不可解除其他員工的裝置', async () => {
      await asEmployee(api().delete('/api/v1/device/unbind'))
        .send({ employeeId: EMP_1, deviceUuid: E1_DEVICE, deviceType: 'ios' }).expect(403);
      expect(await activeDevice(EMP_1)).toEqual([{ device_uuid: E1_DEVICE }]);
    });

    it('管理員可解除任一員工的裝置 (後台重設打卡裝置)', async () => {
      const res = await auth(api().delete('/api/v1/device/unbind'))
        .send({ employeeId: EMP_1, deviceUuid: E1_DEVICE, deviceType: 'ios' }).expect(200);
      expect(res.body.data).toEqual({ employeeId: EMP_1, deviceUuid: E1_DEVICE, isActive: false });
      expect(await activeDevice(EMP_1)).toHaveLength(0);
    });

    it('員工可解除自己的裝置 (不需傳員工編號)', async () => {
      const res = await asEmployee(api().delete('/api/v1/device/unbind'))
        .send({ deviceUuid: DEVICE_UUID, deviceType: 'ios' }).expect(200);
      expect(res.body.data).toMatchObject({ employeeId: EMP_2, isActive: false });
    });

    it('員工可綁定自己的裝置 (不需傳員工編號)', async () => {
      const res = await asEmployee(api().post('/api/v1/device/bind'))
        .send({ deviceUuid: `${DEVICE_UUID}-2`, deviceType: 'ios' }).expect(201);
      expect(res.body.data).toMatchObject({ employeeId: EMP_2, deviceUuid: `${DEVICE_UUID}-2`, isActive: true });
    });
  });
});
