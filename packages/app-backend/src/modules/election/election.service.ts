import { Injectable } from '@nestjs/common';
import { Observable, from } from 'rxjs';
import { concatMap, delay } from 'rxjs/operators';
import { createOmceBackendEnvelope } from '../../envelope.js';
import { RunElectionScanDto } from './dto/election.dto.js';

export interface SseMessageEvent {
  data: {
    type: string;
    payload: unknown;
  };
}

@Injectable()
export class ElectionService {
  runScan(dto: RunElectionScanDto) {
    return createOmceBackendEnvelope({
      request: dto.request,
      options: dto.options
    });
  }

  streamScan(dto: RunElectionScanDto): Observable<SseMessageEvent> {
    const envelope = this.runScan(dto);
    return from(envelope.events).pipe(
      concatMap((event) => from([event]).pipe(delay(20))),
      concatMap((event) => [{ data: event } as SseMessageEvent])
    );
  }
}
