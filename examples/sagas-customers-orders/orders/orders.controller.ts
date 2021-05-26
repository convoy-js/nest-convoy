import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  Post,
} from '@nestjs/common';

import type { Money } from '../common';
import type { Order } from './entities';
import { OrderService } from './order.service';

export class CreateOrderDto {
  orderTotal: Money;
  customerId: number;
}

@Controller('orders')
export class OrdersController {
  constructor(private readonly order: OrderService) {}

  @Post('')
  create(
    @Body() { customerId, orderTotal }: CreateOrderDto,
  ): Promise<Order | null> {
    return this.order.create({
      orderTotal,
      customerId,
    });
  }

  @Get(':id')
  async find(@Param('id') id: Order['id']): Promise<Order> {
    const order = await this.order.find(id);
    if (!order) {
      throw new NotFoundException(`No order found by ID ${id}`);
    }

    return order;
  }
}
