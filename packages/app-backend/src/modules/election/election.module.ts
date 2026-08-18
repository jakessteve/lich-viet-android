import { Module } from '@nestjs/common';
import { ElectionController } from './election.controller.js';
import { ElectionService } from './election.service.js';

@Module({
  controllers: [ElectionController],
  providers: [ElectionService],
  exports: [ElectionService],
})
export class ElectionModule {}
