import { Controller, Post, Get, Req, Headers, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiHeader } from '@nestjs/swagger';
import type { Request } from 'express';
import { ClerkWebhookService } from './clerk-webhook.service';

@ApiTags('Webhooks')
@Controller('user/webhook')
export class ClerkWebhookController {
  constructor(private readonly clerkWebhookService: ClerkWebhookService) {}

  /**
   * Health-check endpoint for Clerk Webhook route
   * GET /user/webhook
   */
  @Get()
  @ApiOperation({ summary: 'Clerk Webhook health-check', description: 'Returns endpoint status message' })
  @ApiResponse({ status: 200, description: 'Webhook endpoint is reachable' })
  handleGet() {
    return {
      message: 'Clerk Webhook endpoint is active. Please send a POST request with Clerk event payload.',
    };
  }

  /**
   * Main Webhook Receiver from Clerk (Svix Signed)
   * POST /user/webhook
   */
  @Post()
  @ApiOperation({ summary: 'Clerk Webhook event receiver', description: 'Verifies Svix signature and synchronizes user.created, user.updated, and user.deleted events' })
  @ApiHeader({ name: 'svix-id', description: 'Svix Webhook message ID', required: true })
  @ApiHeader({ name: 'svix-timestamp', description: 'Svix Webhook timestamp', required: true })
  @ApiHeader({ name: 'svix-signature', description: 'Svix cryptographic signature for verification', required: true })
  @ApiResponse({ status: 200, description: 'Webhook verified and processed successfully' })
  @ApiResponse({ status: 400, description: 'Invalid Svix signature or malformed event payload' })
  async handleWebhook(
    @Body() body: any,
    @Req() req: Request,
    @Headers('svix-id') svixId?: string,
    @Headers('svix-timestamp') svixTimestamp?: string,
    @Headers('svix-signature') svixSignature?: string,
  ) {
    return this.clerkWebhookService.processWebhook(req, { svixId, svixTimestamp, svixSignature }, body);
  }
}
