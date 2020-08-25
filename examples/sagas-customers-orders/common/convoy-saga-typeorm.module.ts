import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from '@nestjs/common';

import { NEST_CONVOY_CONNECTION } from '@nest-convoy/core';

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
      schema: 'nest-convoy',
    } as TypeOrmModuleOptions),
  ],
  exports: [TypeOrmModule],
})
export class ConvoySagaTypeOrmModule {}
