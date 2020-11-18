import { Type } from '@nestjs/common';

import { RuntimeException } from '@nest-convoy/common';

export class MissingApplyMethodException<E> extends RuntimeException {
  constructor(readonly event: E) {
    super();
  }
}

export class OptimisticLockingException extends RuntimeException {}

export class DuplicateTriggeringEventException extends RuntimeException {}

export class EntityNotFoundException<E> extends RuntimeException {
  constructor(readonly aggregateType: Type<E>, readonly entityId: string) {
    super();
  }
}

export class CommandProcessingFailedException extends RuntimeException {
  constructor(error?: RuntimeException) {
    super();
  }
}
