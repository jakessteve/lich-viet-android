import { Injectable } from '@nestjs/common';
import { createWesternChart, createVedicKundli, createSynastryReadiness } from '../../frontend-readiness.js';
import { CreateWesternChartDto, CreateVedicChartDto, CreateSynastryDto } from './dto/astrology.dto.js';

@Injectable()
export class AstrologyService {
  calculateWesternChart(dto: CreateWesternChartDto) {
    const timestamp = new Date(dto.birthDate).getTime();
    return createWesternChart({
      timestamp,
      latitude: dto.birthLocation?.latitude ?? 21.0285,
      longitude: dto.birthLocation?.longitude ?? 105.8542,
      altitudeMeters: dto.birthLocation?.altitudeMeters ?? 19,
      timezone: dto.birthLocation?.timezone ?? 7.0,
      houseSystem: dto.houseSystem ?? 'placidus',
    });
  }

  calculateVedicKundli(dto: CreateVedicChartDto) {
    const timestamp = new Date(dto.birthDate).getTime();
    return createVedicKundli({
      timestamp,
      latitude: dto.birthLocation?.latitude ?? 21.0285,
      longitude: dto.birthLocation?.longitude ?? 105.8542,
      altitudeMeters: dto.birthLocation?.altitudeMeters ?? 19,
      timezone: dto.birthLocation?.timezone ?? 7.0,
      ayanamsa: dto.ayanamsa ?? 'lahiri',
    });
  }

  calculateSynastry(dto: CreateSynastryDto) {
    return createSynastryReadiness({
      personA: {
        birthTimestamp: new Date(dto.person1.birthDate).getTime(),
        latitude: dto.person1.birthLocation?.latitude ?? 21.0285,
        longitude: dto.person1.birthLocation?.longitude ?? 105.8542,
        altitudeMeters: dto.person1.birthLocation?.altitudeMeters ?? 19,
        gender: 'male',
      },
      personB: {
        birthTimestamp: new Date(dto.person2.birthDate).getTime(),
        latitude: dto.person2.birthLocation?.latitude ?? 10.8231,
        longitude: dto.person2.birthLocation?.longitude ?? 106.6297,
        altitudeMeters: dto.person2.birthLocation?.altitudeMeters ?? 19,
        gender: 'female',
      },
    });
  }
}
