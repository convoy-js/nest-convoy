import { Saga } from '../saga';

import { StepBuilder } from './step-builder';
import { NestSagaDefinitionBuilder } from './nest-saga-definition-builder';

export abstract class NestSaga<Data> extends Saga<Data> {
  step(): StepBuilder<Data> {
    return new StepBuilder<Data>(new NestSagaDefinitionBuilder<Data>(this));
  }
}
