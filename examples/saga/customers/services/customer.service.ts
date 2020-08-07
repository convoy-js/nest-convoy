import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Customer } from '../entities';
import { ReserveCreditCommand } from '../commands';

@Injectable()
export class CustomerService {
  constructor(
    @InjectRepository(Customer)
    private customerRepository: Repository<Customer>,
  ) {}

  find(id: Customer['id']): Promise<Customer> {
    return this.customerRepository.findOne(id);
  }

  create(customer: Partial<Customer>): Promise<Customer> {
    return this.customerRepository.save(customer);
  }

  async reserveCredit(
    customer: Customer,
    command: ReserveCreditCommand,
  ): Promise<void> {
    customer.reserveCredit(command.orderId, command.orderTotal);
    await this.customerRepository.update(customer.id, customer);
  }
}
