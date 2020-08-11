import { ResourcePath } from './resource-path';
import {
  getPlaceholderValue,
  isPlaceholder,
  pathSegmentMatches,
} from './utils';

export class ResourcePathPattern extends ResourcePath {
  getPathVariableValues(rp: ResourcePath): Record<string, string> {
    return this.splits.reduce((result, name, idx) => {
      if (isPlaceholder(name)) {
        result[name] = rp.splits[idx];
      }

      return result;
    }, {} as Record<string, string>);
  }

  replacePlaceholders(pathParams: Record<string, string>[]): ResourcePath {
    let idx = 0;

    return new ResourcePath(
      this.splits
        .map(s =>
          isPlaceholder(s) ? getPlaceholderValue(pathParams, idx++) : s,
        )
        .join('/'),
    );
  }

  isSatisfiedBy(rp: ResourcePath): boolean {
    if (this.length !== rp.length) return false;

    return this.splits.every((split, idx) =>
      pathSegmentMatches(split, rp.splits[idx]),
    );
  }
}
