import { Column } from 'typeorm';

import { Money } from '@ftgo-app/libs/common';

export class MenuItem {
  @Column()
  id: string;

  @Column()
  name: string;

  @Column(() => Money)
  money: Money;

  constructor(values: typeof MenuItem) {
    Object.assign(this, values);
  }

  // constructor(id: string, name: string, money: Money) {
  //   this.id = id;
  //   this.name = name;
  //   this.money = money;
  // }
}
