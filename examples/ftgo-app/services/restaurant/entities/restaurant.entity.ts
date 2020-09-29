import { Entity } from 'typeorm/index';
import { AggregateRoot } from '@nest-convoy/core';

import { MenuItem } from './menu-item.entity';

@Entity()
export class Restaurant implements AggregateRoot {
  constructor(readonly id: number, readonly menuItems: MenuItem[]) {}
}
