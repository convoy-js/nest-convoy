import { Column } from 'typeorm';

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

  constructor(values: Address) {
    Object.assign(this, values);
  }
}
