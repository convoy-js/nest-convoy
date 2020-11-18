import { Column } from 'typeorm';

export class Identity {
  @Column()
  firstName: string;

  @Column()
  lastName: string;
}
