import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { ClerkWebhookController } from './webhook/clerk-webhook.controller';
import { ClerkWebhookService } from './webhook/clerk-webhook.service';

@Module({
  controllers: [ClerkWebhookController, UserController],
  providers: [UserService, ClerkWebhookService],
  exports: [UserService, ClerkWebhookService],
})
export class UserModule { }

