import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { PluginsModule } from './plugins/plugins.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env'
    }),
    PluginsModule
  ],
  controllers: [AppController],
  providers: [AppService]
})
export class AppModule {}
