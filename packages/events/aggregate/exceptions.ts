export class MissingApplyMethodException<E> {
  constructor(readonly event: E) {}
}
