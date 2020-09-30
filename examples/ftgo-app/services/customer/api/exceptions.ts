import { RuntimeException } from '@nest-convoy/core';
import { NotFoundException } from '@nestjs/common';

export class CustomerVerificationFailedException extends RuntimeException {}

export class CustomerNotFoundException extends NotFoundException {
  constructor(id: number) {
    super(`No customer could be found by ID ${id}`);
  }
}
