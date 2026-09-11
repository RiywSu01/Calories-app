import { Module } from '@nestjs/common';
import { FoodsService } from './foods.service';
import { FoodsController } from './foods.controller';
import { FatSecretService } from './fatsecret.service';
import { AiVisionService } from './ai-vision.service';

@Module({
  controllers: [FoodsController],
  providers: [FoodsService, FatSecretService, AiVisionService],
  exports: [FoodsService, FatSecretService, AiVisionService],
})
export class FoodsModule {}

