export class SagaData<D> {
  constructor(data: Partial<D>) {
    Object.assign(this, data);
  }
}
