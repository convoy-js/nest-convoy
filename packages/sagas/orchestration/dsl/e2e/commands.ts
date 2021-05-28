import type { CommandWithDestination } from '@nest-convoy/commands';
import { CommandWithDestinationBuilder } from '@nest-convoy/commands';
import { CommandDestination } from '@nest-convoy/core';

import type { ConditionalSagaData } from './conditional-saga.data';
import { ConditionalSaga } from './conditional.saga';

export class Do1Command {}

@CommandDestination('participant1')
export class Undo1Command {}

@CommandDestination('participant2')
export class Do2Command {}

@CommandDestination('participant2')
export class Undo2Command {}

export function do1(): CommandWithDestination {
  return new CommandWithDestinationBuilder(new Do1Command())
    .to('participant1')
    .withExtraHeaders(ConditionalSaga.DO1_COMMAND_EXTRA_HEADERS)
    .build();
}

export function undo1(): Undo1Command {
  return new Undo1Command();
}

export function do2(): Do2Command {
  return new Do2Command();
}

export const isInvoke1 = (data: ConditionalSagaData): boolean => data.invoke1;
