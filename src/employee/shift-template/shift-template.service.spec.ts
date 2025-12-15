import { Test, TestingModule } from '@nestjs/testing';
import { ShiftTemplateService } from './shift-template.service';

describe('ShiftTemplateService', () => {
  let service: ShiftTemplateService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ShiftTemplateService],
    }).compile();

    service = module.get<ShiftTemplateService>(ShiftTemplateService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
