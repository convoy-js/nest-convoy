import { NestSaga, Saga } from '@nest-convoy/sagas/orchestration/dsl';
import { Injectable } from '@nestjs/common';
import { CommandWithDestination } from '@nest-convoy/commands';

import { LocalSagaData } from './local-saga.data';
import { Do2Command, Undo2Command } from './commands';

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

  private do2(): CommandWithDestination {
    return new CommandWithDestination('participant2', new Do2Command());
  }

  private undo2(): CommandWithDestination {
    return new CommandWithDestination('participant2', new Undo2Command());
  }
}
