import { Module } from '@nestjs/common';
import { FoodLogsService } from './food_logs.service';
import { FoodLogsController } from './food_logs.controller';
import { FoodsModule } from '../foods/foods.module';

@Module({
  imports: [FoodsModule],
  controllers: [FoodLogsController],
  providers: [FoodLogsService],
  exports: [FoodLogsService],
})
export class FoodLogsModule {}

