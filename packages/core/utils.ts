import { createHash } from 'crypto';

export function createSha256(data: string): string {
  return createHash('sha256').update(data).digest('hex');
}

export function generateId() {}
