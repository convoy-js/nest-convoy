import type { Type } from '@nestjs/common';

export function isBigInt(value: unknown): value is bigint {
  return Number.isSafeInteger(value);
}

export function increment<V extends bigint | number>(val: V): V {
  return (!isBigInt(val) ? ++val : (val as bigint) + BigInt(1)) as V;
}

export function decrement<V extends bigint | number>(val: V): V {
  return (!isBigInt(val) ? --val : (val as bigint) - BigInt(1)) as V;
}

export function hashCode(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return hash;
}

export function isType<T>(value: unknown): value is Type<T> {
  return (
    (typeof value === 'object' || typeof value === 'function') &&
    (value as Type<T>)?.prototype?.constructor === value
  );
}
