import type { Options } from '@mikro-orm/core';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import type { DynamicModule } from '@nestjs/common';
import { Global, Logger, Module } from '@nestjs/common';

import { ConvoyTransactionContext } from '@nest-convoy/common';

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
          useFactory: () => ({
            logger: (message: string) => Logger.log(message),
            context: () => DatabaseTransactionContext.getEntityManager(),
            discovery: {
              disableDynamicFileAccess: true,
            },
            registerRequestContext: false,
            autoLoadEntities: true,
            strict: true,
            ...options,
          }),
          // TODO: Somehow "inject" doesn't work and causes the app to immediately exit.
          inject: [],
        }),
      ],
      providers: [
        {
          provide: ConvoyTransactionContext,
          useClass: DatabaseTransactionContext,
        },
      ],
      exports: [ConvoyTransactionContext],
    };
  }
}
