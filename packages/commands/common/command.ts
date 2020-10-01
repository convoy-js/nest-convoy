import { Type } from '@nestjs/common';
import { AsyncLikeFn } from '@nest-convoy/common';

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface Command {}

export type CommandType = Type<Command>;

export type CommandProvider<T, C extends Command> = (
  data: T,
) => AsyncLikeFn<[T], C>;
