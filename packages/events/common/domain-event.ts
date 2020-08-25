import { Type } from '@nestjs/common';

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface DomainEvent {}

export type DomainEventType = Type<DomainEvent>;
