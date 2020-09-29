import { Injectable } from '@nestjs/common';

@Injectable()
export abstract class AggregateEvents {
  abstract subscribe(): Promise<void>;
}
