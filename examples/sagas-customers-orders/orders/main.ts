import { MikroORM } from '@mikro-orm/core';
import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';

import { OrdersModule } from './orders.module';

Error.stackTraceLimit = 100;

(async () => {
  const app = await NestFactory.create(OrdersModule, new ExpressAdapter());
  await app.enableShutdownHooks().listenAsync(3031);

  const orm = app.get(MikroORM, { strict: false });
  // await orm.getSchemaGenerator().dropSchema();
  // await orm.getSchemaGenerator().createSchema();
})();
