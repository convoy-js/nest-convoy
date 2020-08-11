import { Builder } from '@nest-convoy/common';

import { SagaDefinition } from '../saga-definition';
import { SagaStep } from './saga-step';
import { SimpleSagaDefinition } from './simple-saga-definition';
import { SimpleSaga } from './simple-saga';

export class SimpleSagaDefinitionBuilder<Data>
  implements Builder<SagaDefinition<Data>> {
  private readonly sagaSteps: SagaStep<Data>[] = [];

  constructor(readonly saga: SimpleSaga<Data>) {}

  addStep(step: SagaStep<Data>): void {
    this.sagaSteps.push(step);
  }

  build(): SagaDefinition<Data> {
    return new SimpleSagaDefinition(this.sagaSteps, this.saga);
  }
}
