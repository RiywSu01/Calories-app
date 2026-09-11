import { Module } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { UserModule } from './user/user.module';
import { FoodsModule } from './foods/foods.module';
import { ProfileModule } from './profile/profile.module';
import { FoodLogsModule } from './food_logs/food_logs.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    CacheModule.register({
      isGlobal: true,
      ttl: 86400 * 1000, // 24-hour default TTL in milliseconds
    }),
    ThrottlerModule.forRoot([
      {
        name: 'short',
        ttl: 1000, // 1 second
        limit: 3,  // max 3 requests per second per IP (Burst protection)
      },
      {
        name: 'medium',
        ttl: 10000, // 10 seconds
        limit: 15,  // max 15 requests per 10 seconds per IP
      },
      {
        name: 'long',
        ttl: 60000, // 1 minute
        limit: 60,  // max 60 requests per minute per IP (Global baseline)
      },
    ]),
    PrismaModule,
    UserModule,
    FoodsModule,
    ProfileModule,
    FoodLogsModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule { }

