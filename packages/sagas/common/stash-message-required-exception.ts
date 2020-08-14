import { RuntimeException } from '@nest-convoy/common';

export class StashMessageRequiredException extends RuntimeException {
  constructor(readonly target: string) {
    super();
  }
}
