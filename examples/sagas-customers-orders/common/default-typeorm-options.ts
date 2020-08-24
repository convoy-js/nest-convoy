import { TypeOrmModuleOptions } from '@nestjs/typeorm/dist/interfaces/typeorm-options.interface';

export const defaultOptions: TypeOrmModuleOptions = {
  host: '0.0.0.0',
  type: 'postgres',
  username: 'postgres',
  password: 'postgres',
  autoLoadEntities: true,
  synchronize: true,
  migrationsRun: true,
};

export { TypeOrmModuleOptions };
