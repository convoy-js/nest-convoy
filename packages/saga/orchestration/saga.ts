import { SagaDefinition } from './saga-definition';

export abstract class Saga<Data> {
  abstract getSagaDefinition(): SagaDefinition<Data>;

  async onStarting(sagaId: string, data: Data): Promise<void> {}
  async onSagaCompletedSuccessfully(
    sagaId: string,
    data: Data,
  ): Promise<void> {}
  async onSagaRolledBack(sagaId: string, data: Data): Promise<void> {}

  getSagaType(): string {
    return this.constructor.name;
  }
}
