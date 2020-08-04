export function splitResourcePath(pathPattern: string): string[] {
  if (!pathPattern.startsWith('/')) {
    throw new TypeError('Should start with / ' + pathPattern);
  }

  return pathPattern.split('/');
}

export function pathSegmentMatches(
  patternSegment: string,
  pathSegment: string,
): boolean {
  return isPlaceholder(patternSegment) || patternSegment === pathSegment;
}

export function isPlaceholder(patternSegment: string): boolean {
  return patternSegment.startsWith('{');
}

export function placeholderName(name: string): string {
  return name.substring(1, name.length - 1);
}
