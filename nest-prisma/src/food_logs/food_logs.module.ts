import { Module } from '@nestjs/common';
import { FoodLogsService } from './food_logs.service';
import { FoodLogsController } from './food_logs.controller';

@Module({
  controllers: [FoodLogsController],
  providers: [FoodLogsService],
})
export class FoodLogsModule {}
