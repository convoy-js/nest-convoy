import { Injectable } from '@nestjs/common';

import { CommandDestination } from '@nest-convoy/core';
import { NestSaga, Saga } from '@nest-convoy/sagas/orchestration/dsl';

import { Do2Command, Undo2Command } from './commands';
import { LocalSagaData } from './local-saga.data';

@Injectable()
export class LocalSagaSteps {
  localStep1(data: LocalSagaData): void {}
  localStep1Compensation(data: LocalSagaData): void {}
  localStep3(data: LocalSagaData): void {}
}

@Saga(LocalSagaData)
export class LocalSaga extends NestSaga<LocalSagaData> {
  readonly sagaDefinition = this.step()
    .invokeLocal(this.steps.localStep1)
    .withCompensation(this.steps.localStep1Compensation)
    .step()
    .invokeParticipant(this.do2)
    .withCompensation(this.undo2)
    .step()
    .invokeLocal(this.steps.localStep3)
    .build();

  constructor(private readonly steps: LocalSagaSteps) {
    super();
  }

  @CommandDestination('participant2')
  private do2(): Do2Command {
    return new Do2Command();
  }

  @CommandDestination('participant2')
  private undo2(): Undo2Command {
    return new Undo2Command();
  }
}
