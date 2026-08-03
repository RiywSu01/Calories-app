import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CreateProfileDto } from './dto/create-profile.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ProfileService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createProfileDto: CreateProfileDto) {
    const data = {
      ...createProfileDto,
      dateOfBirth: createProfileDto.dateOfBirth
        ? new Date(createProfileDto.dateOfBirth)
        : undefined,
    };
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
    if (!result) {
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
    const result = await this.prisma.userProfile.update({
      where: { userId: id },
      data,
    });
    if (!result) {
      throw new NotFoundException(`Profile for userId:${id} not found.`);
    }
    return { message: `Profile for userId:${id} updated successfully.`, data: result };
  }

  async remove(id: string) {
    const result = await this.prisma.userProfile.delete({
      where: { userId: id },
    });
    if (!result) {
      throw new NotFoundException(`Profile for userId:${id} not found.`);
    }
    return { message: `Profile for userId:${id} removed successfully.`, data: result };
  }
}
