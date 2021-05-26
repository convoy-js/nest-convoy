import { MikroORM } from '@mikro-orm/core';
import { UseRequestContext } from '@mikro-orm/nestjs';
import { Body, Controller, Post } from '@nestjs/common';

import type { Money } from '../common';
import { CustomerService } from './customer.service';
import type { Customer } from './entities';

export class CreateCustomerDto {
  creditLimit: Money;
  name: string;
}

@Controller('customers')
export class CustomersController {
  constructor(
    private readonly orm: MikroORM,
    private readonly customer: CustomerService,
  ) {}

  @Post('')
  @UseRequestContext()
  create(@Body() createCustomerDto: CreateCustomerDto): Customer {
    return this.customer.save(createCustomerDto);
  }
}
