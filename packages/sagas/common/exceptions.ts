import { Type } from '@nestjs/common';

import { RuntimeException } from '@nest-convoy/common';

export class StashMessageRequiredException extends RuntimeException {
  constructor(readonly target: string) {
    super();
  }
}

export class StateMachineEmptyException extends RuntimeException {
  constructor(sagaType: Type<any>) {
    super('State machine cannot be empty');
  }
}

export class CannotClaimLockException extends RuntimeException {
  constructor(sagaType: string, sagaId: string, target: string) {
    super('Cannot claim lock');
  }
}

export class CannotClaimResourceLockException extends RuntimeException {
  constructor(resource?: string) {
    super('Cannot claim lock for resource');
  }
}

export class MissingSagaManagerException extends RuntimeException {
  constructor(sagaType: Type<any>) {
    super(`Missing manager for saga ${sagaType.name}`);
  }
}
