import { Test, TestingModule } from '@nestjs/testing';
import { ClerkWebhookController } from './clerk-webhook.controller';
import { UserService } from '../user.service';

describe('ClerkWebhookController', () => {
  let controller: ClerkWebhookController;

  const mockUserService = {
    upsertFromClerk: jest.fn().mockResolvedValue({ userId: 'user_123' }),
    deleteFromClerk: jest.fn().mockResolvedValue({ userId: 'user_123' }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ClerkWebhookController],
      providers: [
        {
          provide: UserService,
          useValue: mockUserService,
        },
      ],
    }).compile();

    controller = module.get<ClerkWebhookController>(ClerkWebhookController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should process user.created webhook event', async () => {
    const req: any = {};
    const body = {
      type: 'user.created',
      data: {
        id: 'user_123',
        email_addresses: [{ id: 'email_1', email_address: 'clerk@example.com' }],
        primary_email_address_id: 'email_1',
        username: 'clerkuser',
      },
    };

    const res = await controller.handleWebhook(body, req, '', '', '');

    expect(mockUserService.upsertFromClerk).toHaveBeenCalledWith({
      id: 'user_123',
      email: 'clerk@example.com',
      username: 'clerkuser',
    });
    expect(res).toEqual({ success: true });
  });

  it('should process user.deleted webhook event', async () => {
    const req: any = {};
    const body = {
      type: 'user.deleted',
      data: {
        id: 'user_123',
        deleted: true,
      },
    };

    const res = await controller.handleWebhook(body, req, '', '', '');

    expect(mockUserService.deleteFromClerk).toHaveBeenCalledWith('user_123');
    expect(res).toEqual({ success: true });
  });
});
