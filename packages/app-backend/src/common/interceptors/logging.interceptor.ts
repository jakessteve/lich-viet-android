import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { FastifyRequest, FastifyReply } from 'fastify';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const ctx = context.switchToHttp();
    const req = ctx.getRequest<FastifyRequest>();
    const startTime = Date.now();

    return next.handle().pipe(
      tap(() => {
        const res = ctx.getResponse<FastifyReply>();
        const elapsed = Date.now() - startTime;
        this.logger.log(
          `[${req.method}] ${req.url} ${res.statusCode} - ${elapsed}ms`
        );
      })
    );
  }
}
