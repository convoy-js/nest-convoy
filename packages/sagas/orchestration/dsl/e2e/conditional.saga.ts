import { NestSaga, Saga } from '@nest-convoy/sagas/orchestration/dsl';

import { ConditionalSagaData } from './conditional-saga.data';
import { do1, do2, isInvoke1, undo1 } from './commands';

@Saga(ConditionalSagaData)
export class ConditionalSaga extends NestSaga<ConditionalSagaData> {
  static readonly DO1_COMMAND_EXTRA_HEADERS = new Map([['k', 'v']]);

  readonly sagaDefinition = this.step()
    .invokeParticipant(do1, isInvoke1)
    .withCompensation(undo1, isInvoke1)
    .step()
    .invokeParticipant(do2)
    .build();
}
