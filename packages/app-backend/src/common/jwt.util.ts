import * as crypto from 'node:crypto';

export interface JwtPayload {
  sub: string; // User ID
  email: string;
  role: string;
  tier: string;
  iat?: number;
  exp?: number;
  [key: string]: unknown;
}

const DEFAULT_SECRET = process.env.JWT_SECRET || 'lichviet-production-jwt-secret-key-2026-apex-standard';

function base64UrlEncode(str: string): string {
  return Buffer.from(str)
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

function base64UrlDecode(str: string): string {
  let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  while (base64.length % 4) {
    base64 += '=';
  }
  return Buffer.from(base64, 'base64').toString('utf8');
}

export function signJwt(payload: JwtPayload, expiresInSeconds = 7 * 86400, secret = DEFAULT_SECRET): string {
  const now = Math.floor(Date.now() / 1000);
  const fullPayload: JwtPayload = {
    ...payload,
    iat: now,
    exp: now + expiresInSeconds,
  };

  const header = { alg: 'HS256', typ: 'JWT' };
  const headerEncoded = base64UrlEncode(JSON.stringify(header));
  const payloadEncoded = base64UrlEncode(JSON.stringify(fullPayload));

  const signature = crypto
    .createHmac('sha256', secret)
    .update(`${headerEncoded}.${payloadEncoded}`)
    .digest('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');

  return `${headerEncoded}.${payloadEncoded}.${signature}`;
}

export function verifyJwt<T extends JwtPayload = JwtPayload>(token: string, secret = DEFAULT_SECRET): T {
  if (!token || typeof token !== 'string') {
    throw new Error('Missing token');
  }

  const parts = token.split('.');
  if (parts.length !== 3) {
    throw new Error('Malformed token format');
  }

  const [headerEncoded, payloadEncoded, signatureProvided] = parts;

  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(`${headerEncoded}.${payloadEncoded}`)
    .digest('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');

  const providedBuf = Buffer.from(signatureProvided);
  const expectedBuf = Buffer.from(expectedSignature);

  if (providedBuf.length !== expectedBuf.length || !crypto.timingSafeEqual(providedBuf, expectedBuf)) {
    throw new Error('Invalid token signature');
  }

  const payload: T = JSON.parse(base64UrlDecode(payloadEncoded));

  if (payload.exp && Math.floor(Date.now() / 1000) > payload.exp) {
    throw new Error('Token expired');
  }

  return payload;
}
