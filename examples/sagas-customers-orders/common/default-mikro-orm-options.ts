import type { Options as MikroOrmOptions } from '@mikro-orm/core';

export const defaultOptions: MikroOrmOptions = {
  host: '0.0.0.0',
  type: 'postgresql',
  dbName: 'orders',
  user: 'postgres',
  password: 'postgres',
  port: 5432,
};

export { MikroOrmOptions };
