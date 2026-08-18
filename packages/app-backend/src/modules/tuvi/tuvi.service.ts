import { Injectable } from '@nestjs/common';
import { createTuViChartReadiness } from '../../frontend-readiness.js';
import { CreateTuViChartDto } from './dto/tuvi.dto.js';

@Injectable()
export class TuViService {
  generateChart(dto: CreateTuViChartDto) {
    return createTuViChartReadiness({
      isoDate: dto.birthDate,
      gender: dto.gender,
      profileId: dto.name || 'tuvi-profile',
      latitude: dto.latitude ?? 21.0285,
      longitude: dto.longitude ?? 105.8542,
      timezone: dto.timezone ?? 7.0,
      altitudeMeters: 19,
      school: dto.school ?? 'nam_phai',
    });
  }
}
