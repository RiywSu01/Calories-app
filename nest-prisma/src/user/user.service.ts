import { Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from '../prisma/prisma.service';
import { clerkClient } from '@clerk/clerk-sdk-node';

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);

  constructor(private readonly prisma: PrismaService) { }

  //---------Logic of clerk webHook (user.created / user.updated / user.deleted)---------//
  // Upserts user data received via Clerk Webhook (user.created / user.updated)
  async upsertFromClerk(data: { id: string; email: string; username: string; role?: string }) {
    this.logger.log(`Upserting user from Clerk Webhook: ${data.id} (${data.email}, role: ${data.role || 'user'})`);

    const role = data.role === 'admin' || data.role === 'user' ? data.role : undefined;

    const result = await this.prisma.user.upsert({
      where: { userId: data.id },
      create: {
        userId: data.id,
        email: data.email,
        username: data.username,
        role: (role as any) || 'user',
      },
      update: {
        email: data.email,
        username: data.username,
        ...(role ? { role: role as any } : {}),
      },
    });

    this.logger.log(`Successfully upserted user in PostgreSQL: ${result.userId} (${result.email}, role: ${result.role})`);
    return result;
  }




  // Deletes user record received via Clerk Webhook (user.deleted)
  async deleteFromClerk(userId: string) {
    this.logger.log(`Deleting user from Clerk Webhook: ${userId}`);
    try {
      return await this.prisma.user.delete({
        where: { userId },
      });
    } catch (error) {
      // User might already be deleted or not existing in local DB
      this.logger.warn(`User ${userId} not found in DB during Clerk deletion webhook: ${error.message}`);
      return null;
    }
  }
  //-----------------------------------------------------------------------------------------//



  //--------------------------Logic of Server side (CRUD)-----------------------------------//  
  /**
   * Create user from NestJS Server side.
   * If userId is not provided, creates user on Clerk side first and gets assigned Clerk ID.
   * If userId is provided (e.g. from Clerk), upserts directly.
   */
  async create(createUserDto: CreateUserDto) {
    let userId = createUserDto.userId;

    if (!userId) {
      try {
        const clerkUser = await clerkClient.users.createUser({
          emailAddress: [createUserDto.email],
          username: createUserDto.username,
        });
        userId = clerkUser.id;
      } catch (clerkError) {
        this.logger.error(`Failed to create user on Clerk: ${clerkError.message}`, clerkError.stack);
        throw new InternalServerErrorException(`Failed to create user on Clerk: ${clerkError.message}`);
      }
    }

    const result = await this.prisma.user.upsert({
      where: { userId },
      create: {
        userId,
        email: createUserDto.email,
        username: createUserDto.username,
        role: createUserDto.role || 'user',
      },
      update: {
        email: createUserDto.email,
        username: createUserDto.username,
      },
    });

    if (!result) {
      throw new InternalServerErrorException('An error occurred while creating the user.');
    }

    return { message: 'New user has been created successfully.', data: result };
  }

  async findAll() {
    const result = await this.prisma.user.findMany({
      include: { profile: true },
    });
    if (!result || result.length === 0) {
      throw new NotFoundException('No users found in the system.');
    }
    return { message: 'All users have been retrieved successfully.', data: result };
  }

  async findOne(id: string) {
    const result = await this.prisma.user.findUnique({
      where: { userId: id },
      include: { profile: true },
    });
    if (!result) {
      throw new NotFoundException(`User id:${id} not found.`);
    }
    return { message: `User id:${id} has been retrieved successfully.`, data: result };
  }

  /**
   * Updates user locally and syncs to Clerk side.
   */
  async update(id: string, updateUserDto: UpdateUserDto) {
    // 1. Update on Clerk side
    try {
      const updateData: { username?: string } = {};
      if (updateUserDto.username) {
        updateData.username = updateUserDto.username;
      }

      if (Object.keys(updateData).length > 0) {
        await clerkClient.users.updateUser(id, updateData);
        this.logger.log(`Updated Clerk user profile: ${id}`);
      }

      if (updateUserDto.role) {
        await clerkClient.users.updateUserMetadata(id, {
          publicMetadata: { role: updateUserDto.role },
        });
        this.logger.log(`Updated Clerk user metadata role: ${id} -> ${updateUserDto.role}`);
      }
    } catch (clerkError) {
      this.logger.warn(`Failed to update Clerk user ${id}: ${clerkError.message}`);
    }


    // 2. Update local database
    try {
      const result = await this.prisma.user.update({
        where: { userId: id },
        data: updateUserDto,
      });

      return { message: `User id:${id} updated successfully.`, data: result };
    } catch (dbError) {
      throw new NotFoundException(`User id:${id} not found in database.`);
    }
  }

  /**
   * Deletes user locally and syncs to Clerk side.
   */
  async remove(id: string) {
    // 1. Delete on Clerk side
    try {
      await clerkClient.users.deleteUser(id);
      this.logger.log(`Deleted Clerk user: ${id}`);
    } catch (clerkError) {
      this.logger.warn(`Failed to delete Clerk user ${id}: ${clerkError.message}`);
    }

    // 2. Delete local database record
    try {
      const result = await this.prisma.user.delete({
        where: { userId: id },
      });

      return { message: `User id:${id} removed successfully.`, data: result };
    } catch (dbError) {
      throw new NotFoundException(`User id:${id} not found in database.`);
    }
  }
}
