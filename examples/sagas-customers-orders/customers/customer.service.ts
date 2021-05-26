import { EntityRepository } from '@mikro-orm/core';
import type { EntityData } from '@mikro-orm/core';
import { InjectRepository } from '@mikro-orm/nestjs';
import { Injectable } from '@nestjs/common';

import type { Money } from '../common';
import { CustomerNotFound } from './api';
import { Customer } from './entities';

@Injectable()
export class CustomerService {
  constructor(
    @InjectRepository(Customer)
    private readonly customerRepository: EntityRepository<Customer>,
  ) {}

  async findOrFail(id: Customer['id']): Promise<Customer> {
    const customer = await this.find(id);
    if (!customer) {
      throw new CustomerNotFound(id);
    }
    return customer;
  }

  async find(id: Customer['id']): Promise<Customer | null> {
    return this.customerRepository.findOne({ id });
  }

  save(data: EntityData<Customer>): Customer {
    const order = this.customerRepository.create(data);
    this.customerRepository.persist(order);
    return order;
  }

  async reserveCredit(
    customerId: Customer['id'],
    orderId: string,
    orderTotal: Money,
  ): Promise<Customer> {
    const customer = await this.findOrFail(customerId);
    customer.reserveCredit(orderId, orderTotal);
    this.customerRepository.persist(customer);
    return customer;
  }
}
