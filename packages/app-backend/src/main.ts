import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { ValidationPipe, Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import fastifyHelmet from '@fastify/helmet';
import fastifyCompress from '@fastify/compress';
import fastifyCors from '@fastify/cors';

import { AppModule } from './app.module.js';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter.js';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor.js';

export async function createApp(): Promise<NestFastifyApplication> {
  const fastifyAdapter = new FastifyAdapter({
    logger: process.env.NODE_ENV !== 'test',
    trustProxy: true,
    bodyLimit: 1048576, // 1MB
  });

  const app = await NestFactory.create<NestFastifyApplication>(AppModule, fastifyAdapter, {
    logger: process.env.NODE_ENV === 'test' ? false : ['error', 'warn', 'log'],
  });

  // Fastify security & compression plugins
  await app.register(fastifyCors, {
    origin: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  });

  await app.register(fastifyHelmet, {
    contentSecurityPolicy: false, // Allows Swagger UI
  });

  await app.register(fastifyCompress, {
    encodings: ['gzip', 'deflate'],
  });

  // Global filters, interceptors, and pipes
  app.useGlobalFilters(new AllExceptionsFilter());
  app.useGlobalInterceptors(new LoggingInterceptor());
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: false,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  // Swagger / OpenAPI documentation
  const config = new DocumentBuilder()
    .setTitle('Lịch Việt & OMCE Metaphysical Computation API')
    .setDescription(
      'High-performance NestJS (Fastify) backend providing calculation endpoints for Âm Lịch, Tử Vi, Chiêm Tinh Tây Phương/Vedic, Mai Hoa, Tam Thức, Electional Astrology, Auth, and Cloud Data Sync.',
    )
    .setVersion('3.1.0')
    .addTag('Authentication')
    .addTag('Users & Profile')
    .addTag('Calendar & Dụng Sự')
    .addTag('Đám Giỗ (Ancestral Anniversaries)')
    .addTag('Tử Vi Đẩu Số')
    .addTag('Astrology (Western, Vedic & Synastry)')
    .addTag('Divination (Mai Hoa & Tam Thức)')
    .addTag('Election (Ngày Tốt & Async Scans)')
    .addTag('Data Synchronization')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  return app;
}

export async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await createApp();
  const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
  const host = process.env.HOST || '0.0.0.0';

  await app.listen(port, host);
  logger.log(`🚀 NestJS Fastify Metaphysical Server running on http://${host}:${port}`);
  logger.log(`📚 OpenAPI Documentation available at http://${host}:${port}/docs`);
}

// Start server when executed directly
if (process.env.NODE_ENV !== 'test' && import.meta.url === `file://${process.argv[1]}`) {
  bootstrap().catch((err) => {
    console.error('Fatal error during bootstrap:', err);
    process.exit(1);
  });
}
