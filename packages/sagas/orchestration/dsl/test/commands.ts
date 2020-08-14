import {
  CommandWithDestination,
  CommandWithDestinationBuilder,
} from '@nest-convoy/commands';

import { ConditionalSaga } from './conditional.saga';
import { ConditionalSagaData } from './conditional-saga.data';

export class Do1Command {}

export class Undo1Command {}

export class Do2Command {}

export class Undo2Command {}

export function do1(): CommandWithDestination {
  return CommandWithDestinationBuilder.send(new Do1Command())
    .to('participant1')
    .withExtraHeaders(ConditionalSaga.DO1_COMMAND_EXTRA_HEADERS)
    .build();
}

export function undo1(): CommandWithDestination {
  return new CommandWithDestination('participant1', new Undo1Command());
}

export function do2(): CommandWithDestination {
  return new CommandWithDestination('participant2', new Do2Command());
}

export const isInvoke1 = (data: ConditionalSagaData) => data.invoke1;
