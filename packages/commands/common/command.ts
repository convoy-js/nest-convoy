export class Command {
  constructor(obj: Record<string, unknown> = {}) {
    Object.assign(this, obj);
  }
}
