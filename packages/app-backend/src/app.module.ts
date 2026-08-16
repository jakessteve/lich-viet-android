import { Module } from '@nestjs/common';
import { CalendarModule } from './modules/calendar/calendar.module.js';
import { TuViModule } from './modules/tuvi/tuvi.module.js';
import { AstrologyModule } from './modules/astrology/astrology.module.js';
import { DivinationModule } from './modules/divination/divination.module.js';
import { ElectionModule } from './modules/election/election.module.js';

@Module({
  imports: [
    CalendarModule,
    TuViModule,
    AstrologyModule,
    DivinationModule,
    ElectionModule
  ]
})
export class AppModule {}
