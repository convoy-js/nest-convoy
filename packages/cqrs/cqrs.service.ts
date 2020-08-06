import { Injectable, OnModuleInit, Type } from '@nestjs/common';
import { Saga, SagaInstanceFactory } from '@nest-convoy/saga/orchestration';
import { ModuleRef } from '@nestjs/core';
import { v4 as uuidv4 } from 'uuid';
import {
  DomainEventDispatcherFactory,
  DomainEventHandler,
  DomainEventHandlers,
  DomainEventHandlersBuilder,
  DomainEventType,
} from '@nest-convoy/events';
import {
  CommandDispatcherFactory,
  CommandHandlersBuilder,
  CommandType,
} from '@nest-convoy/commands';
import { ExplorerService } from '@nestjs/cqrs/dist/services/explorer.service';
import {
  COMMAND_HANDLER_METADATA,
  EVENTS_HANDLER_METADATA,
  SAGA_METADATA,
} from '@nestjs/cqrs/dist/decorators/constants';

import { ICommandHandler, IEventHandler } from './handlers';

@Injectable()
export class CqrsService implements OnModuleInit {
  constructor(
    private readonly sagaInstanceFactory: SagaInstanceFactory,
    private readonly domainEventDispatcherFactory: DomainEventDispatcherFactory,
    private readonly commandDispatcherFactory: CommandDispatcherFactory,
    private readonly explorer: ExplorerService,
    private readonly injector: ModuleRef,
  ) {}

  async onModuleInit(): Promise<void> {
    const { commands, events, queries, sagas } = this.explorer.explore();

    const sagaInstances = sagas
      .map(sagaType => Reflect.getMetadata(SAGA_METADATA, sagaType))
      .map(
        async ({
          target,
          data,
        }: {
          target: Type<Saga<any>>;
          data: Type<any>;
        }) => {
          if (target && data) {
            const saga = this.injector.get(target, {
              strict: false,
            }) as Saga<unknown>;

            console.log(
              await this.sagaInstanceFactory.create(saga, new data()),
            );
          }
        },
      );

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

      const commandHandler = this.injector.get(commandHandlerType, {
        strict: false,
      }) as ICommandHandler<unknown>;

      const commandHandlers = CommandHandlersBuilder.fromChannel(
        commandType.name,
      )
        .onMessage(commandType, commandHandler.execute.bind(commandHandler))
        .build();

      await this.commandDispatcherFactory
        .create(uuidv4(), commandHandlers)
        .subscribe();
    });

    const eventHandlers = events.map(async eventHandlerType => {
      const eventTypes = Reflect.getMetadata(
        EVENTS_HANDLER_METADATA,
        eventHandlerType,
      ) as DomainEventType[];

      const eventHandler = this.injector.get(eventHandlerType, {
        strict: false,
      }) as IEventHandler<unknown>;

      const domainEventHandlers = new DomainEventHandlers(
        eventTypes.map(
          eventType =>
            new DomainEventHandler(
              eventType,
              eventHandler.handle.bind(eventHandler),
            ),
        ),
      );

      await this.domainEventDispatcherFactory
        .create(uuidv4(), domainEventHandlers)
        .subscribe();
    });

    await Promise.all([
      ...commandHandlers,
      ...eventHandlers,
      ...sagaInstances,
    ] as Promise<any>[]);
  }
}
