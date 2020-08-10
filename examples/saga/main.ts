import { NestFactory } from '@nestjs/core';
import {
  SagaInstanceFactory,
  SagaManager,
  SagaManagerFactory,
} from '@nest-convoy/core';

import { AppModule } from './app.module';
import { CustomerService } from './customers/services';
import { Money } from './common';
import { Customer } from './customers/entities';
import { Order } from './orders/entities';
import { OrderDetails } from './orders/common';
import { OrderService } from './orders/services';
import {
  CreateOrderSaga,
  CreateOrderSagaData,
  LocalCreateOrderSaga,
  LocalCreateOrderSagaData,
} from './orders/sagas';
import { ExpressAdapter } from '@nestjs/platform-express';

Error.stackTraceLimit = 100;

export function createRandomOrderDetails(customer: Customer): OrderDetails {
  return Object.assign(new OrderDetails(), {
    customerId: customer.id,
    orderTotal: new Money(((Math.random() * 100) | 0) + 1),
  });
}

// export async function createOrder(
//   customer: Customer,
//   service: OrderService,
//   createOrderSaga: CreateOrderSaga,
//   sagaInstanceFactory: SagaInstanceFactory,
// ): Promise<Order> {
//   const orderDetails = createRandomOrderDetails(customer);
//   const data = new CreateOrderSagaData(undefined, orderDetails);
//   await sagaInstanceFactory.create(createOrderSaga, data);
//   return order;
// }

export async function localCreateOrder(
  customer: Customer,
  service: OrderService,
  localCreateOrderSaga: LocalCreateOrderSaga,
  sagaInstanceFactory: SagaInstanceFactory,
): Promise<Order> {
  const orderDetails = createRandomOrderDetails(customer);
  const data = new LocalCreateOrderSagaData(undefined, orderDetails);
  await sagaInstanceFactory.create(localCreateOrderSaga, data);
  return service.find(data.orderId);
}

(async () => {
  try {
    const app = await NestFactory.create(AppModule, new ExpressAdapter());
    await app.enableShutdownHooks().listenAsync(3030);

    const customerService = app.get(CustomerService);
    const orderService = app.get(OrderService);
    const sagaInstanceFactory = app.get(SagaInstanceFactory);
    const createOrderSaga = app.get(CreateOrderSaga);
    const localCreateOrderSaga = app.get(LocalCreateOrderSaga);

    const customer = await customerService.create({
      name: 'Fred',
      creditLimit: new Money(200.0),
    });

    await localCreateOrder(
      customer,
      orderService,
      localCreateOrderSaga,
      sagaInstanceFactory,
    );
  } catch (err) {
    console.error(err);
  }
})();
