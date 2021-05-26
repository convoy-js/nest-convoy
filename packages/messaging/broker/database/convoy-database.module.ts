import type { Options } from '@mikro-orm/core';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import type { DynamicModule } from '@nestjs/common';
import { Global, Logger, Module } from '@nestjs/common';

import {
  ConvoyTransactionContext,
  NEST_CONVOY_CONNECTION,
} from '@nest-convoy/common';

import { DatabaseTransactionContext } from './database-transaction-context';

export type ConvoyMikroOrmOptions = Omit<
  Options,
  'autoLoadEntities' | 'registerRequestContext' | 'context'
>;

@Global()
@Module({})
export class ConvoyDatabaseModule {
  static forRoot(options: ConvoyMikroOrmOptions): DynamicModule {
    return {
      module: ConvoyDatabaseModule,
      imports: [
        MikroOrmModule.forRootAsync({
          useFactory: (ctx: DatabaseTransactionContext) => ({
            name: NEST_CONVOY_CONNECTION,
            logger: (message: string) => Logger.log(message),
            context: () => ctx.get(),
            discovery: {
              disableDynamicFileAccess: true,
            },
            registerRequestContext: false,
            autoLoadEntities: true,
            strict: true,
            ...options,
          }),
          inject: [ConvoyTransactionContext],
        }),
      ],
      providers: [
        {
          provide: ConvoyTransactionContext,
          useClass: DatabaseTransactionContext,
        },
      ],
      exports: [MikroOrmModule, ConvoyTransactionContext],
    };
  }
}
