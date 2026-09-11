import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { PrismaService } from '../prisma/prisma.service';

describe('UserService', () => {
  let service: UserService;
  let prisma: PrismaService;

  const mockPrismaService = {
    user: {
      create: jest.fn(),
      upsert: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should upsert user from Clerk webhook', async () => {
    mockPrismaService.user.upsert.mockResolvedValue({
      userId: 'user_123',
      email: 'test@example.com',
      username: 'testuser',
      role: 'user',
    });

    const result = await service.upsertFromClerk({
      id: 'user_123',
      email: 'test@example.com',
      username: 'testuser',
    });

    expect(mockPrismaService.user.upsert).toHaveBeenCalledWith({
      where: { userId: 'user_123' },
      create: {
        userId: 'user_123',
        email: 'test@example.com',
        username: 'testuser',
      },
      update: {
        email: 'test@example.com',
        username: 'testuser',
      },
    });
    expect(result.userId).toEqual('user_123');
  });

  it('should delete user from Clerk webhook', async () => {
    mockPrismaService.user.delete.mockResolvedValue({
      userId: 'user_123',
    });

    const result = await service.deleteFromClerk('user_123');
    expect(mockPrismaService.user.delete).toHaveBeenCalledWith({
      where: { userId: 'user_123' },
    });
    expect(result).toBeDefined();
  });
});
