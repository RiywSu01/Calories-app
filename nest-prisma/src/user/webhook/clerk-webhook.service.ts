import { Injectable, Logger, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import type { Request } from 'express';
import { Webhook } from 'svix';
import { UserService } from '../user.service';

export interface SvixHeaders {
  svixId?: string;
  svixTimestamp?: string;
  svixSignature?: string;
}

@Injectable()
export class ClerkWebhookService {
  private readonly logger = new Logger(ClerkWebhookService.name);

  constructor(private readonly userService: UserService) {}

  /**
   * Verifies Svix webhook signature and routes the event to appropriate user sync logic
   */
  async processWebhook(req: Request, headers: SvixHeaders, bodyPayload?: any) {
    const webhookSecret = process.env.CLERK_WEBHOOK_SECRET || process.env.WEBHOOK_SECRET;
    const { svixId, svixTimestamp, svixSignature } = headers;
    const isSvixProvided = svixId && svixTimestamp && svixSignature;

    let payload = bodyPayload || (req as any)?.body;
    let evt: any;

    // 1. Signature Verification with Svix
    if (webhookSecret && webhookSecret !== 'whsec_your_clerk_webhook_secret_here' && isSvixProvided) {
      try {
        const wh = new Webhook(webhookSecret);
        const rawString = (req as any).rawBody
          ? (req as any).rawBody.toString('utf8')
          : typeof payload === 'string'
            ? payload
            : JSON.stringify(payload);

        evt = wh.verify(rawString, {
          'svix-id': svixId,
          'svix-timestamp': svixTimestamp,
          'svix-signature': svixSignature,
        });
      } catch (err: any) {
        this.logger.error(`Webhook verification failed: ${err.message} | Secret: ${webhookSecret?.slice(0, 10)}... | svixId: ${svixId}`);
        throw new BadRequestException(`Webhook verification failed: ${err.message}`);
      }
    } else {
      this.logger.warn('Skipping Svix signature verification for request (local testing / missing headers)');
      evt = payload;
    }

    const type = evt?.type;
    const data = evt?.data;

    this.logger.log(`Received Clerk Webhook Event: ${type}`);

    // 2. Handle Webhook Events (user.created, user.updated, user.deleted)
    try {
      switch (type) {
        case 'user.created':
        case 'user.updated': {
          const primaryEmailObj =
            data?.email_addresses?.find((e: any) => e.id === data.primary_email_address_id) ||
            data?.email_addresses?.[0];

          // For real signups, use real email. For Clerk mock test events (where email_addresses is []), fallback to a unique test email
          const email =
            primaryEmailObj?.email_address ||
            (data?.id ? `${data.id}@clerk.example.com` : 'mock_user@clerk.example.com');

          const username =
            data?.username ||
            [data?.first_name, data?.last_name].filter(Boolean).join('_') ||
            (email ? email.split('@')[0] : 'user');

          const role = data?.public_metadata?.role;

          if (data?.id) {
            await this.userService.upsertFromClerk({
              id: data.id,
              email,
              username,
              role,
            });
          }
          break;

        }

        case 'user.deleted': {
          if (data?.id) {
            await this.userService.deleteFromClerk(data.id);
          }
          break;
        }

        default:
          this.logger.log(`Unhandled Clerk event type: ${type}`);
          break;
      }

      return { success: true };
    } catch (err: any) {
      this.logger.error(`Error processing webhook event ${type}: ${err.message}`, err.stack);
      throw new InternalServerErrorException('Error processing webhook event');
    }
  }
}
