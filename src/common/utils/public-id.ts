import { randomBytes } from 'node:crypto';

export function generatePublicId(prefix: string): string {
  return `${prefix}_${randomBytes(8).toString('hex')}`;
}
