import { Controller, Get, Param, Post } from '@nestjs/common';

import { Customer } from './entities';
import { CustomerService } from './services';
import { CustomerNotFoundException } from './api';

@Controller('customer')
export class CustomerController {
  constructor(private readonly customer: CustomerService) {}

  @Post()
  create() {
    // TODO
  }

  @Get(':id')
  async get(@Param('id') id: number): Promise<Customer> {
    return this.customer.findOrFail(id);
  }
}
