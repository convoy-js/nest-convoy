// import type { Options } from '@mikro-orm/core';
// import { MikroOrmModule } from '@mikro-orm/nestjs';
// import type { DynamicModule } from '@nestjs/common';
import { Global, Module } from '@nestjs/common';
import { ExplorerService } from '@nestjs/cqrs/dist/services/explorer.service';

// import {
//   ConvoyTransactionContext,
//   NEST_CONVOY_CONNECTION,
// } from '@nest-convoy/common';
// import type { DatabaseTransactionContext } from '@nest-convoy/messaging/broker/database';

import { ConvoyCommonModule } from './common.module';
import { InitializerService } from './initializer.service';

// @Global()
@Module({
  imports: [ConvoyCommonModule],
  providers: [ExplorerService, InitializerService],
  // exports: [ConvoyCommonModule],
})
export class ConvoyCoreModule {
  // static forRoot(): DynamicModule {
  //   const module: Required<Omit<DynamicModule, 'controllers' | 'global'>> = {
  //     module: ConvoyCoreModule,
  //     imports: [ConvoyCommonModule],
  //     providers: [ExplorerService, InitializerService],
  //     exports: [ConvoyCommonModule],
  //   };
  //
  //   if (options.database) {
  //     module.imports.push(
  //       MikroOrmModule.forRootAsync({
  //         useFactory: (ctx: DatabaseTransactionContext) => ({
  //           name: NEST_CONVOY_CONNECTION,
  //           registerRequestContext: false,
  //           autoLoadEntities: true,
  //           context: () => ctx.get(),
  //           ...options.database,
  //         }),
  //         inject: [ConvoyTransactionContext],
  //       }),
  //     );
  //     module.exports.push(MikroOrmModule);
  //   }
  //
  //   return module;
  // }
}
