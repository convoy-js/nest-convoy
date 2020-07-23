import { DynamicModule, Module } from '@nestjs/common';

@Module({})
export class NestCQRSModule {
  static forRoot(): DynamicModule {
    return {
      module: NestCQRSModule,
    };
  }
}
