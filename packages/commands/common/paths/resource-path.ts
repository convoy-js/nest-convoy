import { splitResourcePath } from './utils';

export class ResourcePath {
  readonly splits: readonly string[];

  get length(): number {
    return this.splits.length;
  }

  constructor(pathPattern: string) {
    this.splits = splitResourcePath(pathPattern);
  }

  toPath(): string {
    return this.splits.join('/');
  }
}
