import { Type } from '@nestjs/common';

export interface DomainEvent<T = any> extends Type<T> {}
