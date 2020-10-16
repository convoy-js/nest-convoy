import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Restaurant } from './restaurant.entity';
import { MenuItem } from './menu-item.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Restaurant, MenuItem])],
  exports: [TypeOrmModule],
})
export class RestaurantEntitiesModule {}
