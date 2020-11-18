import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Courier } from '../entities/courier.entity';

@Injectable()
export class CourierService {
  constructor(
    @InjectRepository(Courier)
    private readonly repository: Repository<Courier>,
  ) {}

  findAllAvailable(): Promise<Courier[]> {
    return this.repository.find({
      available: true,
    });
  }
}
