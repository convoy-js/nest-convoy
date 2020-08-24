export class LockTarget {
  readonly target: string;

  constructor(target: string | object, targetId: string | object) {
    if (typeof target === 'object' && typeof targetId === 'object') {
      this.target = `${target.constructor.name}/${targetId.constructor.name}`;
    } else {
      this.target = `${target}/${targetId}`;
    }
  }
}

export function createLockTarget(
  target: string | object,
  targetId: string | object,
): string {
  return typeof target === 'object' && typeof targetId === 'object'
    ? `${target.constructor.name}/${targetId.constructor.name}`
    : `${target}/${targetId}`;
}
