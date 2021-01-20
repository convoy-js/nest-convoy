import type { Type } from '@nestjs/common';

export function hashCode(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return hash;
}

export function isType<T>(value: any): value is Type<T> {
  return (
    (typeof value === 'object' || typeof value === 'function') &&
    value?.prototype?.constructor === value
  );
}
