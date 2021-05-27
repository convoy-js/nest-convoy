import { Body, Controller, Post } from '@nestjs/common';

import { Transactional } from '@nest-convoy/database';

import type { Money } from '../common';
import { CustomerService } from './customer.service';
import { Customer } from './entities';

export class CreateCustomerDto {
  creditLimit: Money;
  name: string;
}

@Controller('customers')
export class CustomersController {
  constructor(private readonly customer: CustomerService) {}

  @Post('')
  @Transactional()
  create(@Body() createCustomerDto: CreateCustomerDto): Customer {
    return this.customer.save(createCustomerDto);
  }
}
