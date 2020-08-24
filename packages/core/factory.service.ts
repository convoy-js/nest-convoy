import { Injectable, OnModuleInit, Optional, Type } from '@nestjs/common';
import { ExplorerService } from '@nestjs/cqrs/dist/services/explorer.service';
import {
  COMMAND_HANDLER_METADATA,
  EVENTS_HANDLER_METADATA,
} from '@nestjs/cqrs/dist/decorators/constants';
import { ModuleRef } from '@nestjs/core';

import {
  SagaCommandDispatcherFactory,
  SagaCommandHandler,
} from '@nest-convoy/sagas/participant';
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

import { ICommandHandler, IEventHandler } from './handlers';
import {
  FOR_AGGREGATE_TYPE_METADATA,
  FROM_CHANNEL_METADATA,
  HAS_COMMAND_HANDLER_METADATA,
  SAGA_COMMAND_HANDLER_METADATA,
} from './tokens';

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

    const commandHandlers = commands.map(async commandHandlerType => {
      const commandType = Reflect.getMetadata(
        COMMAND_HANDLER_METADATA,
        commandHandlerType,
      ) as CommandType;
      const commandHandlerChannel = Reflect.getMetadata(
        FROM_CHANNEL_METADATA,
        commandHandlerType,
      ) as string;
      const isSagaCommandHandler = Reflect.hasMetadata(
        SAGA_COMMAND_HANDLER_METADATA,
        commandHandlerType,
      );
      const hasCommandHandler = Reflect.hasMetadata(
        HAS_COMMAND_HANDLER_METADATA,
        commandHandlerType,
      );
      const channel = commandHandlerChannel || commandType.name;

      const commandHandler = this.injector.get(commandHandlerType, {
        strict: false,
      }) as ICommandHandler<unknown>;
      const handler = commandHandler.execute.bind(commandHandler);

      if (hasCommandHandler) {
        const commandHandlers = CommandHandlersBuilder.fromChannel(channel)
          .onMessage(commandType, handler)
          .build();

        await this.commandDispatcherFactory
          .create(commandType.name, commandHandlers)
          .subscribe();
      }

      if (isSagaCommandHandler && this.sagaCommandDispatcherFactory) {
        const sagaCommandHandler = new SagaCommandHandler(
          channel,
          commandType,
          handler,
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
      ) as (() => string) | undefined;

      const eventHandler = this.injector.get(eventHandlerType, {
        strict: false,
      }) as IEventHandler<unknown>;

      const domainEventHandlers = new DomainEventHandlers(
        eventTypes.map(
          eventType =>
            new DomainEventHandler(
              eventType,
              eventHandler.handle.bind(eventHandler),
              aggregateType?.() || eventType.name,
            ),
        ),
      );

      await this.domainEventDispatcherFactory
        .create(eventHandlerType.name, domainEventHandlers)
        .subscribe();
    });

    await Promise.all([...commandHandlers, ...eventHandlers]);
  }
}
