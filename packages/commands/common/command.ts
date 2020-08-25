import { Type } from '@nestjs/common';

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface Command {}

export type CommandType = Type<Command>;

export type CommandProvider<T, C extends Command> = (data: T) => C;
