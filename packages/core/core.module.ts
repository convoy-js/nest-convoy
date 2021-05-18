import { DynamicModule, Module } from '@nestjs/common';
import { ExplorerService } from '@nestjs/cqrs/dist/services/explorer.service';
// import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { EntityManager, MikroORMOptions } from '@mikro-orm/core';
import { AsyncLocalStorage } from 'async_hooks';

import {
  NEST_CONVOY_CONNECTION,
  NEST_CONVOY_SCHEMA,
  NEST_CONVOY_ASYNC_LOCAL_STORAGE,
} from '@nest-convoy/common';

import { ConvoyCommonModule } from './common.module';
import { InitializerService } from './initializer.service';

// export type ConvoyTypeOrmOptions = Omit<
//   TypeOrmModuleOptions,
//   'name' | 'schema'
// >;

export type ConvoyMikroOrmOptions = Omit<
  MikroORMOptions,
  'autoLoadEntities' | 'registerRequestContext' | 'context'
>;

@Module({})
export class ConvoyCoreModule {
  static forRoot(options?: ConvoyMikroOrmOptions): DynamicModule {
    const storage = new AsyncLocalStorage<EntityManager>();

    return {
      module: ConvoyCoreModule,
      imports: [
        ConvoyCommonModule,
        ...(options
          ? [
              MikroOrmModule.forRoot({
                registerRequestContext: false,
                autoLoadEntities: true,
                context: () => storage.getStore(),
                ...options,
              }),
              // TypeOrmModule.forRoot({
              //   name: NEST_CONVOY_CONNECTION,
              //   schema: NEST_CONVOY_SCHEMA,
              //   ...options,
              // } as TypeOrmModuleOptions),
            ]
          : []),
      ],
      providers: [
        {
          provide: NEST_CONVOY_ASYNC_LOCAL_STORAGE,
          useValue: storage,
        },
        ExplorerService,
        InitializerService,
      ],
      exports: options ? [MikroOrmModule] : [],
    };
  }
}
