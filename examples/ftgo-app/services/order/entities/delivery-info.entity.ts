import { Column, CreateDateColumn } from 'typeorm';
import { Address } from '@ftgo-app/libs/common';

export class DeliveryInfo {
  @CreateDateColumn({
    type: 'timestamp',
    // default: () => 'LOCALTIMESTAMP',
  })
  time: Date;

  @Column(() => Address)
  address: Address;
}
