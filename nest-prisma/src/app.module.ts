import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { UserModule } from './user/user.module';
import { FoodsModule } from './foods/foods.module';
import { ProfileModule } from './profile/profile.module';
import { FoodLogsModule } from './food_logs/food_logs.module';

@Module({
  imports: [PrismaModule, UserModule, FoodsModule, ProfileModule, FoodLogsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
