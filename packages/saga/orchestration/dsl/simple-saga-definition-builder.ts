import { Builder } from '@nest-convoy/core';

import { SagaDefinition } from '../saga-definition';
import { SagaStep } from './saga-step';
import { SimpleSagaDefinition } from './simple-saga-definition';

export class SimpleSagaDefinitionBuilder<Data>
  implements Builder<SagaDefinition<Data>> {
  private readonly sagaSteps: SagaStep<Data>[] = [];

  addStep(step: SagaStep<Data>): void {
    this.sagaSteps.push(step);
  }

  build(): SagaDefinition<Data> {
    return new SimpleSagaDefinition(this.sagaSteps);
  }
}
