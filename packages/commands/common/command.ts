import { Type } from '@nestjs/common';

export interface Command {}

export type CommandType = Type<Command>;

export type CommandProvider<T, C extends Command> = (data: T) => C;
