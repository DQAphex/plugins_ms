import { Test, TestingModule } from '@nestjs/testing';
import { PluginsController } from './plugins.controller.js';
import { PluginsService } from './plugins.service.js';

describe('PluginsController', () => {
  let controller: PluginsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PluginsController],
      providers: [PluginsService],
    }).compile();

    controller = module.get<PluginsController>(PluginsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
