export function StateMachine(): ClassDecorator {
  return () => {};
}

export function Schedule(event: any) {}

// export function Behavior(event: object): PropertyDecorator {
//   return () => {};
// }

export function Event(): ClassDecorator {
  return () => {};
}

export interface Initially {
  initially(): BehaviorContext[];
}

export function when<T>(event: T): BehaviorContext<T> {
  return new BehaviorContext<T>(event).when(event);
}

export function during<T>(event: T): BehaviorContext<T> {
  return new BehaviorContext<T>(event).during(event);
}

export function duringAny<T>(event: T): BehaviorContext<T> {
  return new BehaviorContext<T>(event).duringAny(event);
}

enum BehaviorKey {
  WHEN,
  TRANSITION_TO,
  DURING,
  DURING_ANY,
  SCHEDULE,
  PUBLISH,
  UNSCHEDULE,
  ACTIVITY,
  RESPOND,
  IGNORE,
}

export class BehaviorContext<T = object> {
  graph = new Set<[BehaviorKey, any]>();

  constructor(readonly event: T) {}

  when(event: any): this {
    this.graph.add([BehaviorKey.WHEN, event]);
    return this;
  }

  transitionTo(event: any): this {
    this.graph.add([BehaviorKey.TRANSITION_TO, event]);
    return this;
  }

  during(event: any): this {
    this.graph.add([BehaviorKey.DURING, event]);
    return this;
  }

  duringAny(event: any): this {
    this.graph.add([BehaviorKey.DURING_ANY, event]);
    return this;
  }

  activity(cb: () => any): this {
    this.graph.add([BehaviorKey.SCHEDULE, cb]);
    return this;
  }

  schedule(event: any): this {
    this.graph.add([BehaviorKey.SCHEDULE, event]);
    return this;
  }

  unschedule(event: any): this {
    this.graph.add([BehaviorKey.UNSCHEDULE, event]);
    return this;
  }

  publish(event: any): this {
    this.graph.add([BehaviorKey.PUBLISH, event]);
    return this;
  }

  respond(event: any): this {
    this.graph.add([BehaviorKey.RESPOND, event]);
    return this;
  }

  ignore(event: any): this {
    this.graph.add([BehaviorKey.IGNORE, event]);
    return this;
  }
}

export class StateMachineCollector {
  registerBehaviors(behaviors: BehaviorContext[]) {}
}
