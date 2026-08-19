import { Module } from '@nestjs/common';
import { SyncController } from './sync.controller.js';
import { SyncService } from './sync.service.js';
import { CalendarModule } from '../calendar/calendar.module.js';

@Module({
  imports: [CalendarModule],
  controllers: [SyncController],
  providers: [SyncService],
  exports: [SyncService],
})
export class SyncModule {}
