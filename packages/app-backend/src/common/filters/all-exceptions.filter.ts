import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { FastifyReply, FastifyRequest } from 'fastify';

interface HttpExceptionResponseBody {
  message?: string;
  errors?: unknown;
}

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<FastifyReply>();
    const request = ctx.getRequest<FastifyRequest>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal Server Error';
    let errors: unknown = undefined;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const res = exception.getResponse();
      if (typeof res === 'object' && res !== null) {
        const body = res as HttpExceptionResponseBody;
        message = body.message || exception.message;
        errors = body.errors || undefined;
      } else {
        message = exception.message;
      }
    } else if (exception instanceof TypeError || exception instanceof RangeError) {
      status = HttpStatus.UNPROCESSABLE_ENTITY;
      message = exception.message;
    } else if (exception instanceof Error) {
      message = exception.message;
    }

    if (status >= 500) {
      this.logger.error(
        `[${request.method}] ${request.url} - Error: ${message}`,
        exception instanceof Error ? exception.stack : undefined,
      );
    }

    const errorCode =
      status === 401
        ? 'UNAUTHORIZED'
        : status === 403
          ? 'FORBIDDEN'
          : status === 404
            ? 'NOT_FOUND'
            : status === 422
              ? 'UNPROCESSABLE_ENTITY'
              : status === 400
                ? 'BAD_REQUEST'
                : status >= 500
                  ? 'INTERNAL_SERVER_ERROR'
                  : 'REQUEST_FAILED';

    response.status(status).send({
      ok: false,
      error: {
        code: errorCode,
        message,
        details: errors,
      },
      meta: {
        traceId: (request.headers['x-request-id'] as string) || `trace-${Date.now()}`,
        timestamp: new Date().toISOString(),
      },
      statusCode: status,
      path: request.url,
      method: request.method,
      message,
      ...(errors ? { errors } : {}),
    });
  }
}
