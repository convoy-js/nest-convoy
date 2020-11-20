import { DynamicModule, Module } from '@nestjs/common';
import { ExplorerService } from '@nestjs/cqrs/dist/services/explorer.service';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';

import {
  NEST_CONVOY_CONNECTION,
  NEST_CONVOY_SCHEMA,
} from '@nest-convoy/common';

import { ConvoyCommonModule } from './common.module';
import { InitializerService } from './initializer.service';

export type ConvoyTypeOrmOptions = Omit<
  TypeOrmModuleOptions,
  'name' | 'schema'
>;

@Module({})
export class ConvoyCoreModule {
  static forRoot(typeOrmOptions?: ConvoyTypeOrmOptions): DynamicModule {
    return {
      module: ConvoyCoreModule,
      imports: [
        ConvoyCommonModule,
        ...(typeOrmOptions
          ? [
              TypeOrmModule.forRoot({
                name: NEST_CONVOY_CONNECTION,
                schema: NEST_CONVOY_SCHEMA,
                ...typeOrmOptions,
              } as TypeOrmModuleOptions),
            ]
          : []),
      ],
      providers: [ExplorerService, InitializerService],
    };
  }
}
