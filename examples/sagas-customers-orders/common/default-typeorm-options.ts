import { TypeOrmModuleOptions } from '@nestjs/typeorm/dist/interfaces/typeorm-options.interface';

export const defaultOptions: TypeOrmModuleOptions = {
  host: '0.0.0.0',
  type: 'postgres',
  username: 'postgres',
  password: 'postgres',
  autoLoadEntities: true,
  port: 5432,
  synchronize: true,
};

export { TypeOrmModuleOptions };
