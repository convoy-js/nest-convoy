import { SimpleSaga, Saga } from '@nest-convoy/saga/orchestration/dsl';
import {
  CommandWithDestination,
  CommandWithDestinationBuilder,
} from '@nest-convoy/commands';

import { ConditionalSagaData } from './conditional-saga.data';
import { Do1Command, Do2Command, Undo1Command } from './commands';

@Saga(ConditionalSagaData)
export class ConditionalSaga extends SimpleSaga<ConditionalSagaData> {
  static readonly DO1_COMMAND_EXTRA_HEADERS = new Map([['k', 'v']]);

  readonly sagaDefinition = this.step()
    .invokeParticipant(
      this.do1.bind(this),
      (data: ConditionalSagaData) => data.invoke1,
    )
    .withCompensation(
      (data: ConditionalSagaData) => data.invoke1,
      this.undo1.bind(this),
    )
    .step()
    .invokeParticipant(this.do2.bind(this))
    .build();

  private do1(): CommandWithDestination {
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
  }
}
