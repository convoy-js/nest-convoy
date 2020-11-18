import { Type } from '@nestjs/common';

import { Command } from '@nest-convoy/commands/common';

export class CommandEndpoint<C extends Command> {
  constructor(
    readonly channel: string,
    readonly command: Type<C>,
    readonly replies: readonly Type<unknown>[],
  ) {}
}
