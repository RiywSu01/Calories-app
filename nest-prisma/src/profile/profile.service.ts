import { BadRequestException, ConflictException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CreateProfileDto } from './dto/create-profile.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { PrismaService } from '../prisma/prisma.service';
import { AuthProviderType } from '../generated/prisma/enums';

@Injectable()
export class ProfileService {
  constructor(private readonly prisma: PrismaService) { }

  async create(createProfileDto: CreateProfileDto) {
    // 1. Verify that the User exists in the database first
    const userExists = await this.prisma.user.findUnique({
      where: { userId: createProfileDto.userId },
    });

    if (!userExists) {
      throw new NotFoundException(`User with id:${createProfileDto.userId} does not exist in database. Cannot create profile.`);
    }

    // 2. Check if a profile already exists for this user
    const existingProfile = await this.prisma.userProfile.findUnique({
      where: { userId: createProfileDto.userId },
    });

    if (existingProfile) {
      throw new ConflictException(`Profile for user id:${createProfileDto.userId} already exists.`);
    }

    // 3. Prepare data and format dateOfBirth
    const data = {
      ...createProfileDto,
      authProvider: createProfileDto.authProvider || AuthProviderType.Email,
      // Check if dateOfBirth is inserted or not, if inserted change data format to "Date", if not set value to "undefined"
      dateOfBirth: createProfileDto.dateOfBirth ? new Date(createProfileDto.dateOfBirth) : undefined,
    };

    // 4. Create the user profile
    const result = await this.prisma.userProfile.create({ data });
    if (!result) {
      throw new InternalServerErrorException('An error occurred while creating the profile.');
    }

    return { message: 'New profile has been created successfully.', data: result };
  }

  async findAll() {
    const result = await this.prisma.userProfile.findMany({
      include: { user: true },
    });
    if (!result || result.length === 0) {
      throw new NotFoundException('No profiles found in the system.');
    }
    return { message: 'All profiles have been retrieved successfully.', data: result };
  }

  async findOne(id: string) {
    const result = await this.prisma.userProfile.findUnique({
      where: { userId: id },
      include: { user: true },
    });
    if (!result) {
      throw new NotFoundException(`Profile for userId:${id} not found.`);
    }
    return { message: `Profile for userId:${id} has been retrieved successfully.`, data: result };
  }

  async update(id: string, updateProfileDto: UpdateProfileDto) {
    const data = {
      ...updateProfileDto,
      dateOfBirth: updateProfileDto.dateOfBirth
        ? new Date(updateProfileDto.dateOfBirth)
        : undefined,
    };
    try {
      const result = await this.prisma.userProfile.update({
        where: { userId: id },
        data,
      });
      return { message: `Profile for userId:${id} updated successfully.`, data: result };
    } catch (error) {
      throw new NotFoundException(`Profile for userId:${id} not found.`);
    }
  }

  async remove(id: string) {
    try {
      const result = await this.prisma.userProfile.delete({
        where: { userId: id },
      });
      return { message: `Profile for userId:${id} removed successfully.`, data: result };
    } catch (error) {
      throw new NotFoundException(`Profile for userId:${id} not found.`);
    }
  }
}
