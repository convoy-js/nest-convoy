export class DestinationAndResource {
  constructor(readonly destination: string, readonly resource: string) {}

  equals(): boolean {
    return false;
  }
}
