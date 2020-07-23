export class DestinationRootObject<P = any, R = any> {
  constructor(
    readonly parameter: P,
    readonly result: R,
    readonly path?: Map<string, string>,
  ) {}
}
