import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';

import { OrdersModule } from './orders.module';

Error.stackTraceLimit = 100;

(async () => {
  try {
    const app = await NestFactory.create(OrdersModule, new ExpressAdapter());
    await app.enableShutdownHooks().listenAsync(3031);
  } catch (err) {
    console.error(err);
  }
})();
