import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';

describe('AppController', () => {
  let appController: AppController;
  let appService: AppService;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService],
    }).compile();

    appController = app.get<AppController>(AppController);
    appService = app.get<AppService>(AppService);
  });

  describe('root', () => {
    it('回傳 API 版本號', () => {
      expect(appController.getVersion()).toEqual({
        data: appService.getVersion(),
        message: 'suda_punch_api',
      });
    });

    it('版本號為 x.y.z 格式', () => {
      expect(appService.getVersion()).toMatch(/^\d+\.\d+\.\d+$/);
    });
  });
});
