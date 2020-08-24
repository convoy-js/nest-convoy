import { ServerFactory } from '@nestjs/microservices/server/server-factory';
import { ClientProxy } from '@nestjs/microservices/client/client-proxy';
import { Closeable } from '@nestjs/microservices/interfaces/closeable.interface';
import { CustomTransportStrategy } from '@nestjs/microservices/interfaces';
import {
  Inject,
  Injectable,
  Logger,
  OnApplicationShutdown,
  OnModuleInit,
} from '@nestjs/common';
import {
  ClientOptions,
  ClientProxyFactory,
  MicroserviceOptions,
  Server,
} from '@nestjs/microservices';

import { CLIENT_OPTIONS, SERVER_OPTIONS } from './tokens';

@Injectable()
export class MicroserviceProxy implements OnModuleInit, OnApplicationShutdown {
  readonly logger = new Logger(this.constructor.name, true);
  server: Server & CustomTransportStrategy = ServerFactory.create(
    this.serverOptions,
  );
  client: ClientProxy & Closeable = ClientProxyFactory.create(
    this.clientOptions,
  );

  constructor(
    @Inject(SERVER_OPTIONS)
    private readonly serverOptions: MicroserviceOptions,
    @Inject(CLIENT_OPTIONS)
    private readonly clientOptions: ClientOptions,
  ) {}

  async onModuleInit(): Promise<void> {
    await this.server.listen(() =>
      this.logger.log('Started NestConvoy messaging server'),
    );
    await this.client.connect();
  }

  async onApplicationShutdown(): Promise<void> {
    await this.server.close();
    await this.client.close();
  }
}
