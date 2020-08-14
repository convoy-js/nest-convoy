import { NestSaga, Saga } from '@nest-convoy/sagas/orchestration/dsl';
import {
  CommandWithDestination,
  CommandWithDestinationBuilder,
} from '@nest-convoy/commands';

import { ConditionalSagaData } from './conditional-saga.data';
import {
  do1,
  Do1Command,
  do2,
  Do2Command,
  isInvoke1,
  undo1,
  Undo1Command,
} from './commands';

@Saga(ConditionalSagaData)
export class ConditionalSaga extends NestSaga<ConditionalSagaData> {
  static readonly DO1_COMMAND_EXTRA_HEADERS = new Map([['k', 'v']]);

  readonly sagaDefinition = this.step()
    .invokeParticipant(do1, isInvoke1)
    .withCompensation(undo1, isInvoke1)
    .step()
    .invokeParticipant(do2)
    .build();

  /*private do1(): CommandWithDestination {
    return CommandWithDestinationBuilder.send(new Do1Command())
      .to('participant1')
      .withExtraHeaders(ConditionalSaga.DO1_COMMAND_EXTRA_HEADERS)
      .build();
  }

  private undo1(): CommandWithDestination {
    return new CommandWithDestination('participant1', new Undo1Command());
  }

  private do2(): CommandWithDestination {
    return new CommandWithDestination('participant2', new Do2Command());
  }*/
}
