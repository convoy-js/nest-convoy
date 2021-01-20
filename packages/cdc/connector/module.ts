import { Global, Module, HttpModule, DynamicModule } from '@nestjs/common';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { TypeOrmCoreModule } from '@nestjs/typeorm/dist/typeorm-core.module';

export interface CdcModuleOptions {
  readonly database: TypeOrmCoreModule;
  readonly connect: {
    readonly host: string;
    readonly port: number;
  };
}

@Global()
@Module({})
export class CdcModule {
  static forRoot(options: CdcModuleOptions): DynamicModule {
    return {
      module: CdcModule,
      imports: [
        HttpModule.register({
          url: `//${options.connect.host}:${options.connect.port}/connectors/`,
        }),
      ],
    };
  }
}
