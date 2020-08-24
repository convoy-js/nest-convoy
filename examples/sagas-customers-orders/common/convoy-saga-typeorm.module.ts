import { TypeOrmModule } from '@nestjs/typeorm';
import { NEST_CONVOY_CONNECTION } from '@nest-convoy/core';
import { Module } from '@nestjs/common';

import {
  TypeOrmModuleOptions,
  defaultOptions,
} from './default-typeorm-options';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      ...defaultOptions,
      name: NEST_CONVOY_CONNECTION,
      host: '0.0.0.0',
      port: 5432,
      schema: 'sagas',
    } as TypeOrmModuleOptions),
  ],
  exports: [TypeOrmModule],
})
export class ConvoySagaTypeOrmModule {}
