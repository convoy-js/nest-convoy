import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Customer } from './entities';
import { CustomerNotFound } from './replies';
import { Money } from '../common';

@Injectable()
export class CustomerService {
  constructor(
    @InjectRepository(Customer)
    private readonly customerRepository: Repository<Customer>,
  ) {}

  async find(id: Customer['id']): Promise<Customer | undefined> {
    return this.customerRepository.findOne(id);
  }

  async create(customer: Partial<Customer>): Promise<Customer> {
    return this.customerRepository.save(customer);
  }

  async reserveCredit(
    customerId: Customer['id'],
    orderId: number,
    orderTotal: Money,
  ): Promise<Customer> {
    const customer = await this.find(customerId);
    if (!customer) {
      throw new CustomerNotFound(customerId);
    }

    customer.reserveCredit(orderId, orderTotal);
    return this.customerRepository.save(customer);
  }
}
