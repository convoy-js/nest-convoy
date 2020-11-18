import { Column, PrimaryColumn, PrimaryGeneratedColumn } from 'typeorm';

export class LineItem {
  @PrimaryGeneratedColumn()
  id: number;

  @PrimaryColumn()
  menuItemId: number;

  @Column()
  name: string;

  @Column()
  quantity: number;

  constructor(values: LineItem) {
    Object.assign(this, values);
  }
}

export class RevisedOrderLineItem extends LineItem {}
