import { ServerFactory } from '@nestjs/microservices/server/server-factory';
import { ClientProxy } from '@nestjs/microservices/client/client-proxy';
import { Closeable } from '@nestjs/microservices/interfaces/closeable.interface';
import { CustomTransportStrategy } from '@nestjs/microservices/interfaces';
import { ClientProxyFactory, Server } from '@nestjs/microservices';
import {
  Inject,
  Injectable,
  Logger,
  OnApplicationShutdown,
  OnModuleInit,
} from '@nestjs/common';

import { CLIENT_OPTIONS, SERVER_OPTIONS } from './tokens';
import { ConvoyMessagingBrokerModuleOptions } from './microservice-broker.module';

@Injectable()
export class ConvoyMicroserviceProxy
  implements OnModuleInit, OnApplicationShutdown {
  readonly logger = new Logger(this.constructor.name, true);
  readonly server?: Server & CustomTransportStrategy;
  readonly client?: ClientProxy & Closeable;
  readonly retries: number;
  readonly timeout: number;

  constructor(
    @Inject(SERVER_OPTIONS)
    private readonly serverOptions:
      | ConvoyMessagingBrokerModuleOptions['server']
      | undefined,
    @Inject(CLIENT_OPTIONS)
    private readonly clientOptions:
      | ConvoyMessagingBrokerModuleOptions['client']
      | undefined,
  ) {
    if (serverOptions) {
      this.server = ServerFactory.create(serverOptions);
    }

    if (clientOptions) {
      this.client = ClientProxyFactory.create(clientOptions);
    }

    this.retries = clientOptions?.retries || 2;
    this.timeout = clientOptions?.timeout || 1000;
  }

  async onModuleInit(): Promise<void> {
    await this.server?.listen(() =>
      this.logger.log('Started NestConvoy messaging server'),
    );
    await this.client?.connect();
  }

  async onApplicationShutdown(): Promise<void> {
    await this.server?.close();
    await this.client?.close();
  }
}
