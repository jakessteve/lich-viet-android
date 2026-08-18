import { Injectable } from '@nestjs/common';
import { createMaiHoaReading, createTamThucReading } from '../../frontend-readiness.js';
import { CreateMaiHoaDto, CreateTamThucDto } from './dto/divination.dto.js';

@Injectable()
export class DivinationService {
  castMaiHoa(dto: CreateMaiHoaDto) {
    const timestamp = dto.date ? new Date(dto.date).getTime() : Date.now();
    return createMaiHoaReading({
      timestamp,
      number1: dto.number1,
      number2: dto.number2,
      number3: dto.number3,
      query: dto.query,
    });
  }

  calculateTamThuc(dto: CreateTamThucDto) {
    const timestamp = new Date(dto.date).getTime();
    return createTamThucReading({
      timestamp,
      timezone: dto.timezone ?? 7.0,
    });
  }
}
