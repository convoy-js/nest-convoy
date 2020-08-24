import { SagaDefinition } from './saga-definition';

export type SagaLifecycleHooks<Data> = Partial<
  OnSagaRolledBack<Data> & OnSagaCompletedSuccessfully<Data> & OnStarting<Data>
>;

export abstract class Saga<Data> {
  abstract readonly sagaDefinition: SagaDefinition<Data>;
}

export interface OnSagaCompletedSuccessfully<Data> extends Saga<Data> {
  onSagaCompletedSuccessfully(sagaId: string, data: Data): Promise<void> | void;
}

export interface OnStarting<Data> extends Saga<Data> {
  onStarting(sagaId: string, data: Data): Promise<void> | void;
}

export interface OnSagaRolledBack<Data> extends Saga<Data> {
  onSagaRolledBack(sagaId: string, data: Data): Promise<void> | void;
}
