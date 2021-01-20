import { Type, ObjectLiteral, PropertyDecorator } from '@nest-convoy/common';

import { AggregateRoot } from './aggregate-root';

export const AGGREGATE_ID_KEY_METADATA = Symbol('AGGREGATE_ID_KEY_METADATA');
export const APPLY_EVENT_METADATA = Symbol('APPLY_EVENT_METADATA');
export const PROCESS_COMMAND_METADATA = Symbol('PROCESS_COMMAND_METADATA');

export function ApplyEvent<E>(event: Type<E>): MethodDecorator {
  return (target: object, propertyKey: string | symbol) => {
    Reflect.defineMetadata(APPLY_EVENT_METADATA, event, target, propertyKey);
  };
}

export function ProcessCommand<C>(cmd: Type<C>): MethodDecorator {
  return (target: object, propertyKey: string | symbol) => {
    Reflect.defineMetadata(PROCESS_COMMAND_METADATA, cmd, target, propertyKey);
  };
}

export function getAggregateId(
  target: AggregateRoot,
): string | number | undefined {
  const key = Reflect.getMetadata(AGGREGATE_ID_KEY_METADATA, target);
  return (target as ObjectLiteral)[key];
}

export function AggregateId(): PropertyDecorator<AggregateRoot> {
  return (target, propertyKey) =>
    Reflect.defineMetadata(AGGREGATE_ID_KEY_METADATA, propertyKey, target);
}
