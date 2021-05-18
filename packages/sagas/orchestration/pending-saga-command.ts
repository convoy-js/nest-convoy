import type { Command } from '@nest-convoy/commands';

export class PendingSagaCommand {
  constructor(
    readonly destination: string,
    readonly resource: string,
    readonly command: Command,
  ) {}
}
