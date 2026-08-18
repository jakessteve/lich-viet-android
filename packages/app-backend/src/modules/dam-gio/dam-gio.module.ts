import { Module } from '@nestjs/common';
import { DamGioController } from './dam-gio.controller.js';
import { DamGioService } from './dam-gio.service.js';

@Module({
  controllers: [DamGioController],
  providers: [DamGioService],
  exports: [DamGioService],
})
export class DamGioModule {}
