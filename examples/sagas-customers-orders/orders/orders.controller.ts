import { MikroORM } from '@mikro-orm/core';
import { UseRequestContext } from '@mikro-orm/nestjs';
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
import { OrderRepositoryR } from './order.repository';

export class CreateOrderDto {
  orderTotal: Money;
  customerId: string;
}

@Controller('orders')
export class OrdersController {
  constructor(
    private readonly orm: MikroORM,
    private readonly order: OrderService,
    private readonly orderRepository: OrderRepositoryR,
  ) {}

  @Post('')
  @UseRequestContext()
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
    const order = await this.orderRepository.find(id);
    if (!order) {
      throw new NotFoundException(`No order found by ID ${id}`);
    }

    return order;
  }
}
