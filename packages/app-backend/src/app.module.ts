import { Module } from '@nestjs/common';
import { CalendarModule } from './modules/calendar/calendar.module.js';
import { TuViModule } from './modules/tuvi/tuvi.module.js';
import { AstrologyModule } from './modules/astrology/astrology.module.js';
import { DivinationModule } from './modules/divination/divination.module.js';
import { ElectionModule } from './modules/election/election.module.js';
import { AuthModule } from './modules/auth/auth.module.js';
import { UsersModule } from './modules/users/users.module.js';
import { SyncModule } from './modules/sync/sync.module.js';

@Module({
  imports: [
    AuthModule,
    UsersModule,
    CalendarModule,
    TuViModule,
    AstrologyModule,
    DivinationModule,
    ElectionModule,
    SyncModule,
  ],
})
export class AppModule {}

