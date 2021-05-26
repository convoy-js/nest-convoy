import type { OnModuleInit } from '@nestjs/common';
import { Injectable, Optional } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { ExplorerService } from '@nestjs/cqrs/dist/services/explorer.service';

import type {
  CommandMessageHandler,
  CommandMessageHandlerOptions,
} from '@nest-convoy/commands';
import {
  CommandDispatcherFactory,
  CommandHandlers,
  CommandHandlersBuilder,
} from '@nest-convoy/commands';
import type { DomainEventMessageHandler } from '@nest-convoy/events';
import {
  DomainEventDispatcherFactory,
  DomainEventHandlersBuilder,
} from '@nest-convoy/events';
import {
  SagaCommandDispatcherFactory,
  SagaCommandHandler,
} from '@nest-convoy/sagas/participant';

import {
  AGGREGATE_TYPE_METADATA,
  COMMAND_MESSAGE_HANDLER,
  COMMAND_MESSAGE_HANDLER_OPTIONS,
  DOMAIN_EVENT_HANDLER,
  FROM_CHANNEL_METADATA,
  HAS_COMMAND_HANDLER_METADATA,
  SAGA_COMMAND_HANDLER_METADATA,
} from './tokens';

interface PropertyType<K> {
  readonly property: K;
  readonly type: any;
}

@Injectable()
export class InitializerService implements OnModuleInit {
  constructor(
    private readonly domainEventDispatcherFactory: DomainEventDispatcherFactory,
    private readonly commandDispatcherFactory: CommandDispatcherFactory,
    private readonly explorer: ExplorerService,
    private readonly injector: ModuleRef,
    @Optional()
    private readonly sagaCommandDispatcherFactory: SagaCommandDispatcherFactory,
  ) {}

  private getMethodTypes<I, K extends keyof I>(
    token: string,
    instance: I,
  ): readonly PropertyType<K>[] {
    return Object.getOwnPropertyNames(Object.getPrototypeOf(instance))
      .filter(property => Reflect.hasMetadata(token, instance, property))
      .map(property => {
        const type = Reflect.getMetadata(token, instance, property);
        return {
          property,
          type,
        };
      }) as PropertyType<K>[];
  }

  async onModuleInit(): Promise<void> {
    const { commands, events } = this.explorer.explore();

    console.log(commands, events);

    const commandHandlers = (commands || []).map(async instanceType => {
      const channel = Reflect.getMetadata(
        FROM_CHANNEL_METADATA,
        instanceType,
      ) as string | undefined;
      if (!channel) return;

      const isSagaCommandHandler = Reflect.hasMetadata(
        SAGA_COMMAND_HANDLER_METADATA,
        instanceType,
      );
      const hasCommandHandler = Reflect.hasMetadata(
        HAS_COMMAND_HANDLER_METADATA,
        instanceType,
      );

      const instance = this.injector.get(instanceType, {
        strict: false,
      }) as Record<string, CommandMessageHandler>;

      if (hasCommandHandler) {
        const commandHandlers = this.getMethodTypes(
          COMMAND_MESSAGE_HANDLER,
          instance,
        )
          .reduce((builder, { property, type }) => {
            const handler = instance[property].bind(instance);
            const options = Reflect.getMetadata(
              COMMAND_MESSAGE_HANDLER_OPTIONS,
              instance,
              property,
            ) as CommandMessageHandlerOptions;

            return builder.onMessage(type, handler, options);
          }, new CommandHandlersBuilder(channel))
          .build();

        await this.commandDispatcherFactory
          .create(instanceType.name, commandHandlers)
          .subscribe();
      }

      if (isSagaCommandHandler && this.sagaCommandDispatcherFactory) {
        // TODO: SagaCommandHandlersBuilder
        const sagaCommandHandlers = this.getMethodTypes(
          COMMAND_MESSAGE_HANDLER,
          instance,
        ).map(({ property, type }) => {
          const handler = instance[property].bind(instance);
          const options = Reflect.getMetadata(
            COMMAND_MESSAGE_HANDLER_OPTIONS,
            instance,
            property,
          ) as CommandMessageHandlerOptions;

          return new SagaCommandHandler(channel, type, handler, options);
        });

        await this.sagaCommandDispatcherFactory
          .create(instanceType.name, new CommandHandlers(sagaCommandHandlers))
          .subscribe();
      }
    });

    const domainEventHandlers = (events || []).map(async instanceType => {
      const aggregateType = Reflect.getMetadata(
        AGGREGATE_TYPE_METADATA,
        instanceType,
      ) as (() => string) | undefined;
      if (!aggregateType) return;

      const instance = this.injector.get(instanceType, {
        strict: false,
      }) as Record<string, DomainEventMessageHandler<any>>;

      const domainEventHandlers = this.getMethodTypes(
        DOMAIN_EVENT_HANDLER,
        instance,
      )
        .reduce(
          (builder, { property, type }) =>
            builder.onEvent(type, instance[property].bind(instance)),
          new DomainEventHandlersBuilder(aggregateType()),
        )
        .build();

      await this.domainEventDispatcherFactory
        .create(instanceType.name, domainEventHandlers)
        .subscribe();
    });

    await Promise.all([...commandHandlers, ...domainEventHandlers]);
  }
}
