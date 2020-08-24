import { DynamicModule, Module } from '@nestjs/common';
import { ExplorerService } from '@nestjs/cqrs/dist/services/explorer.service';

import { ConvoyCommonModule } from './common.module';
import { FactoryService } from './factory.service';

@Module({})
export class ConvoyCoreModule {
  static forRoot(): DynamicModule {
    return {
      module: ConvoyCoreModule,
      imports: [ConvoyCommonModule],
      providers: [ExplorerService, FactoryService],
    };
  }
}
