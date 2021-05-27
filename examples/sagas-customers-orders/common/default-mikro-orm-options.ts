import type { Options as MikroOrmOptions } from '@mikro-orm/core';
import { ReflectMetadataProvider } from '@mikro-orm/core';

export const defaultOptions: MikroOrmOptions = {
  metadataProvider: ReflectMetadataProvider,
  host: '0.0.0.0',
  type: 'postgresql',
  dbName: 'postgres',
  user: 'postgres',
  password: 'postgres',
  port: 5432,
  debug: true,
};

export { MikroOrmOptions };
