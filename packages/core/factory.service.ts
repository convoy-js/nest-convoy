import { Injectable, OnModuleInit, Optional, Type } from '@nestjs/common';
import {
  SagaCommandDispatcherFactory,
  SagaCommandHandler,
} from '@nest-convoy/sagas';
import { ModuleRef } from '@nestjs/core';
import {
  DomainEventDispatcherFactory,
  DomainEventHandler,
  DomainEventHandlers,
  DomainEventType,
} from '@nest-convoy/events';
import {
  CommandDispatcherFactory,
  CommandHandlers,
  CommandHandlersBuilder,
  CommandType,
} from '@nest-convoy/commands';
import { ExplorerService } from '@nestjs/cqrs/dist/services/explorer.service';
import {
  COMMAND_HANDLER_METADATA,
  EVENTS_HANDLER_METADATA,
} from '@nestjs/cqrs/dist/decorators/constants';

import { ICommandHandler, IEventHandler } from './handlers';
import { FOR_AGGREGATE_TYPE_METADATA, FROM_CHANNEL_METADATA } from './tokens';

@Injectable()
export class FactoryService implements OnModuleInit {
  constructor(
    private readonly domainEventDispatcherFactory: DomainEventDispatcherFactory,
    private readonly commandDispatcherFactory: CommandDispatcherFactory,
    private readonly explorer: ExplorerService,
    private readonly injector: ModuleRef,
    @Optional()
    private readonly sagaCommandDispatcherFactory: SagaCommandDispatcherFactory,
  ) {}

  async onModuleInit(): Promise<void> {
    const { commands, events, queries, sagas } = this.explorer.explore();

    // const sagaInstances = sagas
    //   .map(sagaType => Reflect.getMetadata(SAGA_METADATA, sagaType))
    //   .map(
    //     async ({
    //       target,
    //       data,
    //     }: {
    //       target: Type<Saga<any>>;
    //       data: Type<any>;
    //     }) => {
    //       if (target && data) {
    //         const saga = this.injector.get(target, {
    //           strict: false,
    //         }) as Saga<unknown>;
    //
    //         console.log(
    //           await this.sagaInstanceFactory.create(saga, new data()),
    //         );
    //       }
    //     },
    //   );

    /*


  async onModuleInit(): Promise<void> {
    const commandHandlers = CommandHandlersBuilder.fromChannel(REPLY_CHANNEL)
      .onMessage(DoSomethingCommand, this.doSomething.bind(this))
      .build();

    await this.commandDispatcherFactory
      .create(COMMAND_DISPATCHER_ID, commandHandlers)
      .subscribe();
     */

    const commandHandlers = commands.map(async commandHandlerType => {
      const commandType = Reflect.getMetadata(
        COMMAND_HANDLER_METADATA,
        commandHandlerType,
      ) as CommandType;
      const commandHandlerChannel = Reflect.getMetadata(
        FROM_CHANNEL_METADATA,
        commandHandlerType,
      ) as string;
      const channel = commandHandlerChannel || commandType.name;

      const commandHandler = this.injector.get(commandHandlerType, {
        strict: false,
      }) as ICommandHandler<unknown>;
      const handler = commandHandler.execute.bind(commandHandler);

      const commandHandlers = CommandHandlersBuilder.fromChannel(channel)
        .onMessage(commandType, handler)
        .build();

      await this.commandDispatcherFactory
        .create(commandType.name, commandHandlers)
        .subscribe();

      if (this.sagaCommandDispatcherFactory) {
        // TODO: Move this
        const sagaCommandHandler = new SagaCommandHandler(
          channel,
          commandType,
          handler,
          null,
        );
        const sagaCommandHandlers = new CommandHandlers([sagaCommandHandler]);

        await this.sagaCommandDispatcherFactory
          .create(commandType.name, sagaCommandHandlers)
          .subscribe();
      }
    });

    const eventHandlers = events.map(async eventHandlerType => {
      const eventTypes = Reflect.getMetadata(
        EVENTS_HANDLER_METADATA,
        eventHandlerType,
      ) as DomainEventType[];
      const aggregateType = Reflect.getMetadata(
        FOR_AGGREGATE_TYPE_METADATA,
        eventHandlerType,
      ) as (() => Type<any>) | undefined;

      const eventHandler = this.injector.get(eventHandlerType, {
        strict: false,
      }) as IEventHandler<unknown>;

      const domainEventHandlers = new DomainEventHandlers(
        eventTypes.map(
          eventType =>
            new DomainEventHandler(
              eventType,
              eventHandler.handle.bind(eventHandler),
              aggregateType?.()?.name,
            ),
        ),
      );

      await this.domainEventDispatcherFactory
        .create(eventHandlerType.name, domainEventHandlers)
        .subscribe();
    });

    await Promise.all([
      ...commandHandlers,
      ...eventHandlers,
      // ...sagaInstances,
    ] as Promise<any>[]);
  }
}
