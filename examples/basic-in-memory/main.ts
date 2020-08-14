import { NestFactory } from '@nestjs/core';

import { AppModule } from './app.module';

(async () => {
  try {
    const app = await NestFactory.createApplicationContext(AppModule);
    await app.enableShutdownHooks().init();
  } catch (e) {
    console.error(e);
  }
})();
