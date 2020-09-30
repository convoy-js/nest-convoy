import { Column } from 'typeorm/index';

export class Address {
  @Column()
  street1: string;

  @Column()
  street2: string;

  @Column()
  city: string;

  @Column()
  state: string;

  @Column()
  zip: string;

  constructor(values: typeof Address) {
    Object.assign(this, values);
  }
}
