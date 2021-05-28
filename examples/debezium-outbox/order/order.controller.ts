import { Body, Controller, Post } from '@nestjs/common';

import { Transactional } from '@nest-convoy/database';

import { Order } from './entities';
import { OrderService } from './order.service';

@Controller('orders')
export class OrderController {
  constructor(private readonly orders: OrderService) {}

  @Post('')
  createOrder(@Body() dto: any): Order {
    return this.orders.create();
  }
}
