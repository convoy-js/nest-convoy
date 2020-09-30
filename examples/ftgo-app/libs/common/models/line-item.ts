import { Column, PrimaryColumn, PrimaryGeneratedColumn } from 'typeorm/index';

export class LineItem {
  @PrimaryGeneratedColumn()
  id: number;

  @PrimaryColumn()
  menuItemId: string;

  @Column()
  name: string;

  @Column()
  quantity: number;

  constructor(menuItemId: string, name: string, quantity: number) {
    this.menuItemId = menuItemId;
    this.name = name;
    this.quantity = quantity;
  }
}
