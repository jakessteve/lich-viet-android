import { Injectable } from '@nestjs/common';
import {
  createCalendarDayDetail,
  createDungSuCatalog,
  createDungSuScoreDetail
} from '../../frontend-readiness.js';

@Injectable()
export class CalendarService {
  getDayDetail(date?: string, timezone: number = 7) {
    const inputDate = date ? new Date(date) : new Date();
    return createCalendarDayDetail({
      date: inputDate,
      location: { timezone }
    });
  }

  getDungSuCatalog() {
    return createDungSuCatalog();
  }

  getDungSuScore(date?: string, eventId?: string) {
    const inputDate = date ? new Date(date) : new Date();
    return createDungSuScoreDetail({
      date: inputDate,
      eventId: eventId ?? 'ds_kai_shi'
    });
  }
}
