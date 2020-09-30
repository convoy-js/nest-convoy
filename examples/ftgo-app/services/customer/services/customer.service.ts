import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm/index';

import { Identity, Money } from '@ftgo-app/libs/common';

import { Customer } from '../entities';
import { CustomerDomainEventPublisher } from './domain-event-publisher';
import { CustomerCreated, CustomerNotFoundException } from '../api';

@Injectable()
export class CustomerService {
  constructor(
    private readonly domainEventPublisher: CustomerDomainEventPublisher,
    @InjectRepository(Customer)
    private readonly repository: Repository<Customer>,
  ) {}

  async findOrFail(id: Customer['id']): Promise<Customer> {
    const customer = await this.repository.findOne(id);
    if (!customer) {
      throw new CustomerNotFoundException(id);
    }
    return customer;
  }

  async validateOrder(customerId: number, orderTotal: Money): Promise<void> {
    const customer = await this.findOrFail(customerId);
    customer.validateOrder(orderTotal);
  }

  async create(identity: Identity): Promise<Customer> {
    const customer = await this.repository.save({ identity });
    await this.domainEventPublisher.publish(customer, [new CustomerCreated()]);
    return customer;
  }
}
