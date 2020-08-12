import { TypeOrmModule } from '@nestjs/typeorm';
import { NEST_CONVOY_SAGA_CONNECTION } from '@nest-convoy/saga';
import { Module } from '@nestjs/common';

import {
  TypeOrmModuleOptions,
  defaultOptions,
} from './default-typeorm-options';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      ...defaultOptions,
      name: NEST_CONVOY_SAGA_CONNECTION,
      host: 'sagas-db',
      port: 5434,
      database: 'sagasdb',
    } as TypeOrmModuleOptions),
  ],
  exports: [TypeOrmModule],
})
export class ConvoySagaTypeOrmModule {}
