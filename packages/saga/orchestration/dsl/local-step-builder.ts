import { Consumer } from '@nest-convoy/common';

import { SagaDefinition } from '../saga-definition';
import { BaseStepBuilder, StepBuilder } from './step-builder';
import { SimpleSagaDefinitionBuilder } from './simple-saga-definition-builder';
import { LocalStep } from './local-step';

export class LocalStepBuilder<Data> implements BaseStepBuilder<Data> {
  private compensation?: Consumer<Data>;

  constructor(
    private readonly parent: SimpleSagaDefinitionBuilder<Data>,
    private readonly handler: Consumer<Data>,
  ) {}

  private addStep() {
    this.parent.addStep(new LocalStep<Data>(this.handler, this.compensation));
  }

  withCompensation(localCompensation: Consumer<Data>): this {
    this.compensation = localCompensation;
    return this;
  }

  step(): StepBuilder<Data> {
    this.addStep();
    return new StepBuilder<Data>(this.parent);
  }

  build(): SagaDefinition<Data> {
    this.addStep();
    // TODO - pull up with template method for completing current step
    return this.parent.build();
  }
}
