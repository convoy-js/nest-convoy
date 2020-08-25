import { Builder } from '@nest-convoy/common';

import { SagaDefinition } from '../saga-definition';
import { SagaStep } from './saga-step';
import { NestSagaDefinition } from './nest-saga-definition';
import { NestSaga } from './nest-saga';

export class NestSagaDefinitionBuilder<Data>
  implements Builder<SagaDefinition<Data>> {
  private readonly sagaSteps: SagaStep<Data>[] = [];

  constructor(readonly saga: NestSaga<Data>) {}

  addStep(step: SagaStep<Data>): void {
    this.sagaSteps.push(step);
  }

  build(): SagaDefinition<Data> {
    return new NestSagaDefinition(this.sagaSteps);
  }
}
