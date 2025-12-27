import { Test, TestingModule } from '@nestjs/testing';
import { PunchPointController } from './punch-point.controller';
import { PunchPointService } from './punch-point.service';

describe('PunchPointController', () => {
  let controller: PunchPointController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PunchPointController],
      providers: [PunchPointService],
    }).compile();

    controller = module.get<PunchPointController>(PunchPointController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
