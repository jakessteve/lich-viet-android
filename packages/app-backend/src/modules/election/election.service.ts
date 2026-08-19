import { Injectable } from '@nestjs/common';
import { Observable } from 'rxjs';
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
      options: dto.options,
    });
  }

  streamScan(dto: RunElectionScanDto): Observable<SseMessageEvent> {
    return new Observable<SseMessageEvent>((subscriber) => {
      let isCancelled = false;

      // Execute asynchronously yielding to event loop
      setImmediate(() => {
        try {
          if (isCancelled) return;
          const envelope = this.runScan(dto);

          let eventIdx = 0;
          const emitNext = () => {
            if (isCancelled || subscriber.closed) return;

            if (eventIdx < envelope.events.length) {
              const event = envelope.events[eventIdx++];
              subscriber.next({ data: event });
              // Yield each event to the event loop
              setTimeout(emitNext, 10);
            } else {
              subscriber.complete();
            }
          };

          emitNext();
        } catch (err) {
          subscriber.error(err);
        }
      });

      return () => {
        isCancelled = true;
      };
    });
  }
}
