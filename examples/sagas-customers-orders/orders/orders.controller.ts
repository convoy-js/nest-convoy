import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  Post,
} from '@nestjs/common';

import { Money } from '../common';
import { OrderService } from './order.service';
import { Order } from './entities';

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
  ): Promise<Order | undefined> {
    return this.order.create({
      orderTotal,
      customerId,
    });
  }

  @Get(':id')
  async find(@Param('id') id: number): Promise<Order> {
    const order = await this.order.find(id);
    if (!order) {
      throw new NotFoundException(`No order found by ID ${id}`);
    }

    return order;
  }
}
