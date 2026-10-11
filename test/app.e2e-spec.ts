// test/app.e2e-spec.ts
// 需連線實際資料庫：NODE_ENV=development npm run test:e2e -- app
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import { AppService } from './../src/app.service';
import { ResponseInterceptor } from './../src/common/response.interceptor';

describe('AppController (e2e)', () => {
  let app: INestApplication<App>;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalInterceptors(new ResponseInterceptor());
    await app.init();
  });

  afterAll(async () => {
    await app?.close();
  });

  it('/ (GET) 回傳標準格式的 API 版本號', () => {
    return request(app.getHttpServer())
      .get('/')
      .expect(200)
      .expect({
        statusCode: 200,
        success: true,
        message: 'suda_punch_api',
        data: app.get(AppService).getVersion(),
      });
  });
});
