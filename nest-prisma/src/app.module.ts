import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaService } from './prisma/prisma.service';
import { PrismaModule } from './prisma/prisma.module';
import { UserModule } from './user/user.module';
import { DailyLogsModule } from './daily_logs/daily_logs.module';
import { FoodsModule } from './foods/foods.module';
import { ProfileModule } from './profile/profile.module';

@Module({
  imports: [PrismaModule, UserModule, DailyLogsModule, FoodsModule, ProfileModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
