import { Builder } from '@nest-convoy/core';

import { SagaDefinition } from './saga-definition';

export class SagaDefinitionBuilder<Data> implements Builder<SagaDefinition> {
  build(): SagaDefinition {
    return undefined;
  }
}
