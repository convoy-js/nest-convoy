import { DynamicModule, Module } from '@nestjs/common';

@Module({})
export class NestSagaModule {
  static forRoot(): DynamicModule {
    return {
      module: NestSagaModule,
    };
  }
}
