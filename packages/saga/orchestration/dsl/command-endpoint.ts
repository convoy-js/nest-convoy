import { Command } from '@nest-convoy/commands/common';
import { Type } from '@nestjs/common';

export class CommandEndpoint<C extends Command = object> {
  constructor(
    readonly commandChannel: string,
    readonly command: Type<C>,
    readonly replies: Type<any>[],
  ) {}
}
