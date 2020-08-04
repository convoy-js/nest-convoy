import { Command } from '@nest-convoy/commands/common';

import { ParticipantParamsAndCommand } from './participant-params-and-command';

export class ParticipantInvocationBuilder {
  private readonly params = new Map([[this.key, this.value]]);

  constructor(private readonly key: string, private readonly value: string) {}

  withCommand<C extends Command>(command: C): ParticipantParamsAndCommand<C> {
    return new ParticipantParamsAndCommand<C>(this.params, command);
  }
}
