import type { Instance } from '@nest-convoy/common';

export class LockTarget {
  readonly target: string;

  constructor(
    target: string | Instance | undefined,
    targetId: string | Instance | undefined,
  ) {
    if (typeof target === 'object' && typeof targetId === 'object') {
      this.target = `${target.constructor.name}/${targetId.constructor.name}`;
    } else if (target != null && targetId != null) {
      this.target = `${target}/${targetId}`;
    }
  }
}
