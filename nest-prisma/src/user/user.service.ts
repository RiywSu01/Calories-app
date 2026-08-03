import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createUserDto: CreateUserDto) {
    const result = await this.prisma.user.create({ data: createUserDto });
    if (!result) {
      throw new InternalServerErrorException('An error occurred while creating the user.');
    }
    return { message: 'New user has been created successfully.', data: result };
  }

  async findAll() {
    const result = await this.prisma.user.findMany({
      include: { profile: true },
    });
    if (!result) {
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

  async update(id: string, updateUserDto: UpdateUserDto) {
    const result = await this.prisma.user.update({
      where: { userId: id },
      data: updateUserDto,
    });
    if (!result) {
      throw new NotFoundException(`User id:${id} not found.`);
    }
    return { message: `User id:${id} updated successfully.`, data: result };
  }

  async remove(id: string) {
    const result = await this.prisma.user.delete({
      where: { userId: id },
    });
    if (!result) {
      throw new NotFoundException(`User id:${id} not found.`);
    }
    return { message: `User id:${id} removed successfully.`, data: result };
  }
}
