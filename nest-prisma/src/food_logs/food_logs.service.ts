import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CreateFoodLogDto } from './dto/create-food_log.dto';
import { UpdateFoodLogDto } from './dto/update-food_log.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class FoodLogsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createFoodLogDto: CreateFoodLogDto) {
    const result = await this.prisma.foodLog.create({ data: createFoodLogDto });
    if (!result) {
      throw new InternalServerErrorException('An error occurred while creating the FoodLog.');
    }
    return { message: 'New FoodLog has been created successfully.', data: result };
  }

  async findAll() {
    const result = await this.prisma.foodLog.findMany({
      include: { user: true, food: true },
    });
    if (!result) {
      throw new NotFoundException('No FoodLogs found in the system.');
    }
    return { message: 'All FoodLogs have been retrieved successfully.', data: result };
  }

  async findOne(id: string) {
    const result = await this.prisma.foodLog.findUnique({
      where: { foodLogId: id },
      include: { user: true, food: true },
    });
    if (!result) {
      throw new NotFoundException(`FoodLog id:${id} not found.`);
    }
    return { message: `FoodLog id:${id} has been retrieved successfully.`, data: result };
  }

  async update(id: string, updateFoodLogDto: UpdateFoodLogDto) {
    const result = await this.prisma.foodLog.update({
      where: { foodLogId: id },
      data: updateFoodLogDto,
    });
    if (!result) {
      throw new NotFoundException(`FoodLog id:${id} not found.`);
    }
    return { message: `FoodLog id:${id} updated successfully.`, data: result };
  }

  async remove(id: string) {
    const result = await this.prisma.foodLog.delete({ where: { foodLogId: id } });
    if (!result) {
      throw new NotFoundException(`FoodLog id:${id} not found.`);
    }
    return { message: `FoodLog id:${id} removed successfully.`, data: result };
  }
}
