import { Test, TestingModule } from '@nestjs/testing';
import { ShiftTemplateController } from './shift-template.controller';

describe('ShiftTemplateController', () => {
  let controller: ShiftTemplateController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ShiftTemplateController],
    }).compile();

    controller = module.get<ShiftTemplateController>(ShiftTemplateController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
