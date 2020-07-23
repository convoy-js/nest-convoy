export function Saga(channel?: string): ClassDecorator {
  // channel defaults to class name
  return () => {};
}

export function Compensate(): MethodDecorator {
  return () => {};
}

export function InvokeParticipant(): MethodDecorator {
  return () => {};
}
