import { Injectable } from '@nestjs/common';

import { Transactional } from '@nest-convoy/database';

import { Order } from './entities';

@Injectable()
export class OrderService {
  constructor() {}

  @Transactional()
  create(): Order {}
}
