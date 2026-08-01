import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CreateFoodDto } from './dto/create-food.dto';
import { UpdateFoodDto } from './dto/update-food.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class FoodsService {
  constructor(private readonly prisma: PrismaService) { }
  
  async create(createFoodDto: CreateFoodDto) {
    const result = await this.prisma.foods.create({ data: createFoodDto });
    if (!result) {
      throw new InternalServerErrorException('An error occurred while creating the food.');
    }
    return { message: 'New Food has been created successfully.', data: result };
  }

  async findAll() {
    const result = await this.prisma.foods.findMany();
    if (!result) {
      throw new NotFoundException('No foods found in the system.');
    }
    return { message: 'All Food has been retrieved successfully.', data: result };
  }

  async findOne(id: string) {
    const result = await this.prisma.foods.findUnique({ where: { food_id: id } });
    if (!result) {
      throw new NotFoundException(`Food id:${id} not found.`);
    }
    return { message: `Food id:${id} has been retrieved successfully.`, data: result };
  }

  async update(id: string, updateFoodDto: UpdateFoodDto) {
    const result = await this.prisma.foods.update({ where: { food_id: id }, data: updateFoodDto });
    if (!result) {
      throw new NotFoundException(`Food id:${id} not found.`);
    }
    return { message: `Food id:${id} updated successfully.`, data: result };
  }

  async remove(id: string) {
    const result = await this.prisma.foods.delete({ where: { food_id: id } });
    if (!result) {
      throw new NotFoundException(`Food id:${id} not found.`);
    }
    return { message: `Food id:${id} removed successfully.`, data: result };
  }
}