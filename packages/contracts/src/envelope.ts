import { z } from 'zod';

export interface ApiEnvelope<T = unknown> {
  ok: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
  meta?: {
    traceId?: string;
    timestamp?: string;
  };
}

export const ApiErrorSchema = z.object({
  code: z.string(),
  message: z.string(),
  details: z.unknown().optional(),
});

export const ApiMetaSchema = z.object({
  traceId: z.string().optional(),
  timestamp: z.string().optional(),
});

export function createApiEnvelopeSchema<T extends z.ZodTypeAny>(dataSchema: T) {
  return z.object({
    ok: z.boolean(),
    data: dataSchema.optional(),
    error: ApiErrorSchema.optional(),
    meta: ApiMetaSchema.optional(),
  });
}
