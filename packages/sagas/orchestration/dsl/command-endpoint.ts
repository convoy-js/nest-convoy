import type { Command } from '@nest-convoy/commands/common';
import type { Type } from '@nest-convoy/common';

export class CommandEndpoint<C extends Command> {
  constructor(
    readonly channel: string,
    readonly command: Type<C>,
    readonly replies: readonly Type<unknown>[],
  ) {}
}
