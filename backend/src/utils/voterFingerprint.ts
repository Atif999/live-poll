import crypto from 'node:crypto';
import type { Request } from 'express';

export function getVoterFingerprint(req: Request) {
  const forwardedFor = req.headers['x-forwarded-for'];
  const ip = Array.isArray(forwardedFor) ? forwardedFor[0] : forwardedFor?.split(',')[0] ?? req.ip;
  const ua = req.headers['user-agent'] ?? 'unknown';

  return crypto.createHash('sha256').update(`${ip}:${ua}`).digest('hex');
}
