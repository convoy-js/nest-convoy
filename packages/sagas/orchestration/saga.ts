import type { AsyncLike } from '@nest-convoy/common';

import type { SagaDefinition } from './saga-definition';

export type SagaLifecycleHooks<Data> = Partial<
  OnSagaRolledBack<Data> &
    OnSagaCompletedSuccessfully<Data> &
    OnSagaStarting<Data>
>;

export abstract class Saga<Data> implements SagaLifecycleHooks<Data> {
  abstract readonly sagaDefinition: SagaDefinition<Data>;
}

export interface OnSagaCompletedSuccessfully<Data = any> extends Saga<Data> {
  onSagaCompletedSuccessfully(sagaId: string, data: Data): AsyncLike<void>;
}

export interface OnSagaStarting<Data = any> extends Saga<Data> {
  onSagaStarting(sagaId: string, data: Data): AsyncLike<void>;
}

export interface OnSagaRolledBack<Data = any> extends Saga<Data> {
  onSagaRolledBack(sagaId: string, data: Data): AsyncLike<void>;
}
