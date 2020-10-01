import { Injectable } from '@nestjs/common';

import { NestSaga, Saga } from '@nest-convoy/sagas/orchestration/dsl';
import { Failure, Success } from '@nest-convoy/commands';

import { ConditionalSagaData } from './conditional-saga.data';
import { do1, do2, isInvoke1, undo1 } from './commands';

@Injectable()
export class WithReplyHandlers {
  success1(data: ConditionalSagaData, reply: Success): void {}
  failure1(data: ConditionalSagaData, reply: Failure): void {}
  compensating(data: ConditionalSagaData, reply: Success): void {}
  success2(data: ConditionalSagaData, reply: Success): void {}
  failure2(data: ConditionalSagaData, reply: Failure): void {}
}

@Saga(ConditionalSagaData)
export class WithReplyHandlersSaga extends NestSaga<ConditionalSagaData> {
  readonly sagaDefinition = this.step()
    .invokeParticipant(do1, isInvoke1)
    .onReply(Failure, this.handlers.failure1)
    .onReply(Success, this.handlers.success1)
    .withCompensation(undo1, isInvoke1)
    .onReply(Success, this.handlers.compensating)
    .step()
    .invokeParticipant(do2)
    .onReply(Failure, this.handlers.failure2)
    .onReply(Success, this.handlers.success2)
    .build();

  constructor(private readonly handlers: WithReplyHandlers) {
    super();
  }
}
