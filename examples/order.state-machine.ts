// import { OnModuleInit } from '@nestjs/common';
// import {
//   StateMachine,
//   BehaviorContext,
//   Initially,
//   Event,
//   StateMachineCollector,
//   during,
//   when,
// } from '@nest-convoy/saga/OLD/state-machine';
//
// @Event()
// export class SubmitOrder {}
//
// @Event()
// export class Submitted {}
//
// @Event()
// export class Accepted {}
//
// @Event()
// export class OrderAccepted {}
//
// @StateMachine()
// export class OrderStateMachine implements OnModuleInit, Initially {
//   // @Behavior(SubmitOrder)
//   // submitOrder: BehaviorState<SubmitOrder>;
//
//   // @Behavior(Submitted)
//   // submitted: BehaviorState<Submitted>;
//
//   constructor(private readonly collector: StateMachineCollector) {}
//
//   initially(): BehaviorContext[] {
//     return [
//       when(SubmitOrder).transitionTo(Submitted),
//       when(OrderAccepted).transitionTo(Accepted),
//     ];
//   }
//
//   onModuleInit(): void {
//     const submitted = during(Submitted)
//       .when(OrderAccepted)
//       .transitionTo(Accepted);
//
//     this.collector.registerBehaviors(this.initially());
//   }
// }
