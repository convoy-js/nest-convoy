import { Command } from '@nest-convoy/commands/common';

export class ParticipantParamsAndCommand<C extends Command> {
  constructor(readonly params: Map<string, string>, readonly command: C) {}
}
