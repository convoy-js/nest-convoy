import { MikroORM } from '@mikro-orm/core';
import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';

import { CustomersModule } from './customers.module';

(async () => {
  const app = await NestFactory.create(CustomersModule, new ExpressAdapter());
  await app.enableShutdownHooks().listenAsync(3032);

  const orm = app.get(MikroORM, { strict: false });
  // await orm.getSchemaGenerator().createSchema();
})();
