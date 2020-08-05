import { NestFactory } from '@nestjs/core';
import { NestConvoyCommandProducer } from '@nest-convoy/commands/producer';
import { NestConvoyMessageConsumer } from '@nest-convoy/messaging/consumer';
import { ReplyMessageHeaders } from '@nest-convoy/commands/common';
import { Message } from '@nest-convoy/messaging/common';

import { AppModule } from './app.module';
import { COMMAND_CHANNEL, REPLY_CHANNEL } from './tokens';
import { DoSomethingCommand } from './do-something-command';

(async () => {
  const app = await NestFactory.createApplicationContext(AppModule);

  const commandProducer = app.get(NestConvoyCommandProducer);
  const messageConsumer = app.get(NestConvoyMessageConsumer);

  const subscriberId = 'subscriberId-' + Date.now();
  let message: Message | undefined;
  await messageConsumer.subscribe(
    subscriberId,
    [REPLY_CHANNEL],
    (m: Message) => {
      message = m;
    },
  );

  const commandId = await commandProducer.send(
    COMMAND_CHANNEL,
    new DoSomethingCommand(),
    REPLY_CHANNEL,
  );

  const poll = setInterval(() => {
    if (!message) return;
    console.log(
      commandId,
      message.getRequiredHeader(ReplyMessageHeaders.IN_REPLY_TO),
    );

    clearInterval(poll);
  }, 10);
})();
