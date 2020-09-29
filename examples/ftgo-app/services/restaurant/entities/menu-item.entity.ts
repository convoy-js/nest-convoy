import { Money } from '@ftgo-app/libs/common';

export class MenuItem {
  constructor(
    readonly id: string,
    readonly name: string,
    readonly money: Money,
  ) {}
}
