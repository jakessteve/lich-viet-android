import { Module } from '@nestjs/common';
import { DivinationController } from './divination.controller.js';
import { DivinationService } from './divination.service.js';

@Module({
  controllers: [DivinationController],
  providers: [DivinationService],
  exports: [DivinationService],
})
export class DivinationModule {}
