import { Body, Controller, Post } from '@nestjs/common';

import { Money } from '../common';
import { CustomerService } from './customer.service';
import { Customer } from './entities';

export class CreateCustomerDto {
  creditLimit: Money;
  name: string;
}

@Controller('customers')
export class CustomersController {
  constructor(private readonly customer: CustomerService) {}

  @Post()
  create(@Body() createCustomerDto: CreateCustomerDto): Promise<Customer> {
    return this.customer.create(createCustomerDto);
  }
}
