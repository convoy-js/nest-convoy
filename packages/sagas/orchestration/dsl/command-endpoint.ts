import { Type } from '@nestjs/common';

import { Command } from '@nest-convoy/commands/common';

export class CommandEndpoint<C extends Command = Command> {
  constructor(
    readonly commandChannel: string,
    readonly command: Type<C>,
    readonly replies: Type<unknown>[],
  ) {}
}
