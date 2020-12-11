import { Consumer } from '@nest-convoy/common';

import { SagaDefinition } from '../saga-definition';
import { BaseStepBuilder, StepBuilder } from './step-builder';
import { NestSagaDefinitionBuilder } from './nest-saga-definition-builder';
import { LocalStep } from './local-step';

export class LocalStepBuilder<Data> implements BaseStepBuilder<Data> {
  private compensation?: Consumer<Data>;

  constructor(
    private readonly parent: NestSagaDefinitionBuilder<Data>,
    private readonly handler: Consumer<Data>,
  ) {}

  private addStep() {
    this.parent.addStep(
      new LocalStep<Data>(
        this.handler.bind(this.parent.saga),
        this.compensation,
      ),
    );
  }

  /**
   * Compensates for action failures in a reversed order
   */
  withCompensation(localCompensation: Consumer<Data>): this {
    this.compensation = localCompensation.bind(this.parent.saga);
    return this;
  }

  /**
   * Step
   */
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
