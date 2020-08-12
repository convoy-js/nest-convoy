import { TypeOrmModuleOptions } from '@nestjs/typeorm/dist/interfaces/typeorm-options.interface';

export const defaultOptions: TypeOrmModuleOptions = {
  type: 'postgres',
  username: 'postgresuser',
  password: 'postgrespw',
  autoLoadEntities: true,
  synchronize: true,
  migrationsRun: true,
};

export { TypeOrmModuleOptions };
