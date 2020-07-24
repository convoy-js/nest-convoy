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
