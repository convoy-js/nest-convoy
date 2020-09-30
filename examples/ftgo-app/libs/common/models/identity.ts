import { Column } from 'typeorm/index';

export class Identity {
  @Column()
  firstName: string;

  @Column()
  lastName: string;
}
