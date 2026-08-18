// Pure Calculation & Envelope Exports (Framework-Agnostic, Isomorphic)
export { createOmceBackendEnvelope } from './envelope.js';
export {
  createCalendarDayDetail,
  createDungSuCatalog,
  createDungSuScoreDetail,
  createFrontendErrorCatalog,
  createFrontendReadinessBundle,
  createMaiHoaReading,
  createPanchangMuhurat,
  createPersonalizationOverlay,
  createSynastryReadiness,
  createTamThucReading,
  createTuViChartReadiness,
  createUserBirthProfileContract,
  createVedicKundli,
  createWesternChart,
} from './frontend-readiness.js';

// NestJS Fastify Application & Module Exports
export { AppModule } from './app.module.js';
export { createApp, bootstrap } from './main.js';
export { AuthModule } from './modules/auth/auth.module.js';
export { AuthService } from './modules/auth/auth.service.js';
export { UsersModule } from './modules/users/users.module.js';
export { DamGioModule } from './modules/dam-gio/dam-gio.module.js';
export { DamGioService } from './modules/dam-gio/dam-gio.service.js';
export { CalendarModule } from './modules/calendar/calendar.module.js';
export { CalendarService } from './modules/calendar/calendar.service.js';
export { TuViModule } from './modules/tuvi/tuvi.module.js';
export { TuViService } from './modules/tuvi/tuvi.service.js';
export { AstrologyModule } from './modules/astrology/astrology.module.js';
export { AstrologyService } from './modules/astrology/astrology.service.js';
export { DivinationModule } from './modules/divination/divination.module.js';
export { DivinationService } from './modules/divination/divination.service.js';
export { ElectionModule } from './modules/election/election.module.js';
export { ElectionService } from './modules/election/election.service.js';
export { SyncModule } from './modules/sync/sync.module.js';
export { SyncService } from './modules/sync/sync.service.js';
