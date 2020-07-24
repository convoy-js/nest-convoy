import { RuntimeException } from '@nest-convoy/core';

export class StashMessageRequiredException extends RuntimeException {
  constructor(readonly target: string) {
    super();
  }
}
