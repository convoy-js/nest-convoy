import { Command } from '@nest-convoy/commands/common';
import { ObjectLiteral } from '@nest-convoy/common';

import { AggregateRoot } from './aggregate-root';
import { PROCESS_COMMAND_METADATA, APPLY_EVENT_METADATA } from './decorators';
import { AggregateException } from './exceptions';

export abstract class CommandProcessingAggregate<
  T extends CommandProcessingAggregate<T, CT>,
  CT extends Command,
> /*<
  T extends CommandProcessingAggregate<T, C>,
  C extends Command
> */ extends AggregateRoot<T> {
  /** @internal */
  private readonly _eventMethods = new Map<string, string>();
  /** @internal */
  private readonly _keys = Object.getOwnPropertyNames(
    this.constructor.prototype,
  );

  /** @internal */
  private _handle<T>(target: any, metadataKey: symbol): T {
    let methodName = this._eventMethods.get(metadataKey.toString());
    if (!methodName) {
      methodName = this._keys.find(key => {
        const meta = Reflect.getMetadata(metadataKey, this.constructor, key);
        return meta?.constructor === target.constructor;
      });
      if (!methodName) {
        throw new AggregateException('not found');
      }
      this._eventMethods.set(metadataKey.toString(), methodName);
    }

    return (this as ObjectLiteral)[methodName](target);
  }

  async process<C, E extends readonly any[]>(cmd: C): Promise<E> {
    return this._handle(cmd, PROCESS_COMMAND_METADATA);
  }

  async applyEvent<E>(event: E): Promise<this> {
    return this._handle(event, APPLY_EVENT_METADATA);
  }
}
