import { Entity, EntityRepository, Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';

export class TransactionalRepository<
  E extends Record<string, any>
> extends Repository<E> {
  constructor() {
    super();
  }
}

@Entity()
export class User {}

@Injectable()
@EntityRepository(User)
export class UserRepository extends TransactionalRepository<User> {}
