import { Module } from '@nestjs/common';
import { PluginsService } from './plugins.service.js';
import { PluginsController } from './plugins.controller.js';
import { DatabaseModule } from '../database/database.module.js';

@Module({
  imports: [DatabaseModule],
  controllers: [PluginsController],
  providers: [PluginsService],
})
export class PluginsModule {}
