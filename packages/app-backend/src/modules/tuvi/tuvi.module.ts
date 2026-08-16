import { Module } from '@nestjs/common';
import { TuViController } from './tuvi.controller.js';
import { TuViService } from './tuvi.service.js';

@Module({
  controllers: [TuViController],
  providers: [TuViService],
  exports: [TuViService]
})
export class TuViModule {}
