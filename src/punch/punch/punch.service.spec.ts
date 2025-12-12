import { Test, TestingModule } from '@nestjs/testing';
import { PunchService } from './punch.service';

describe('PunchService', () => {
  let service: PunchService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PunchService],
    }).compile();

    service = module.get<PunchService>(PunchService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
