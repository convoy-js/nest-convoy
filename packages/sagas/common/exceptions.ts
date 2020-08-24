import { RuntimeException } from '@nest-convoy/common';

export class StashMessageRequiredException extends RuntimeException {
  constructor(readonly target: string) {
    super();
  }
}

export class CannotClaimLockException extends RuntimeException {
  constructor() {
    super('Cannot claim lock');
  }
}

export class CannotClaimResourceLockException extends RuntimeException {
  constructor() {
    super('Cannot claim lock for resource');
  }
}
