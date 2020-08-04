import { Type } from '@nestjs/common';

export interface DomainEvent {}

export type DomainEventType = Type<DomainEvent>;
