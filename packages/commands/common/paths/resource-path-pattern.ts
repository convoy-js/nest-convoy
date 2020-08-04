import { ResourcePath } from './resource-path';
import { isPlaceholder, pathSegmentMatches } from './utils';

export class ResourcePathPattern extends ResourcePath {
  getPathVariableValues(mr: ResourcePath): Record<string, string> {
    return this.splits.reduce((result, name, idx) => {
      if (isPlaceholder(name)) {
        result[name] = mr.splits[idx];
      }

      return result;
    }, {} as Record<string, string>);
  }

  isSatisfiedBy(mr: ResourcePath): boolean {
    if (this.length !== mr.length) return false;

    return this.splits.some((split, idx) =>
      pathSegmentMatches(split, mr.splits[idx]),
    );
  }
}
