import { Saga } from '../saga';

import { StepBuilder } from './step-builder';
import { SimpleSagaDefinitionBuilder } from './simple-saga-definition-builder';

export abstract class SimpleSaga<Data> extends Saga<Data> {
  step(): StepBuilder<Data> {
    return new StepBuilder<Data>(
      new SimpleSagaDefinitionBuilder<Data>() /*, this*/,
    );
  }
}
