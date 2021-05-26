import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';

import { CustomersModule } from './customers.module';

(async () => {
  const app = await NestFactory.create(CustomersModule, new ExpressAdapter());
  await app.enableShutdownHooks().listenAsync(3032);
})();
