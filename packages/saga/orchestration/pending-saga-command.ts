import { Command } from '@nest-convoy/commands/common';

export class PendingSagaCommand {
  constructor(
    readonly destination: string,
    readonly resource: string,
    readonly command: Command,
  ) {}
}
