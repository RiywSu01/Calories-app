import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CreateFoodLogDto } from './dto/create-food_log.dto';
import { UpdateFoodLogDto } from './dto/update-food_log.dto';
import { PrismaService } from '../prisma/prisma.service';
import { FatSecretService } from '../foods/fatsecret.service';
import { MealType } from '../generated/prisma/enums';

@Injectable()
export class FoodLogsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly fatsecretService: FatSecretService,
  ) { }

  async create(createFoodLogDto: CreateFoodLogDto) {
    const rawMealType = String(createFoodLogDto.mealType).toUpperCase() as MealType;
    const isFatSecretFood = !!(createFoodLogDto.fatsecretFoodId || createFoodLogDto.fatsecret_food_id);

    // 100% ToS Compliant: For FatSecret foods, store ONLY ID references + quantity in PostgreSQL
    const data = {
      userId: createFoodLogDto.userId,
      foodId: createFoodLogDto.foodId || undefined,
      fatsecretFoodId: createFoodLogDto.fatsecretFoodId || createFoodLogDto.fatsecret_food_id || undefined,
      fatsecretServingId: createFoodLogDto.fatsecretServingId || createFoodLogDto.fatsecret_serving_id || undefined,
      quantity: Number(createFoodLogDto.quantity) || 1,
      // For custom user recipes (foodId), store macros. For FatSecret cloud foods, leave null in DB.
      totalCalories: isFatSecretFood ? undefined : (createFoodLogDto.totalCalories != null ? Math.round(Number(createFoodLogDto.totalCalories)) : undefined),
      totalProtein: isFatSecretFood ? undefined : (createFoodLogDto.totalProtein != null ? Number(createFoodLogDto.totalProtein) : undefined),
      totalFat: isFatSecretFood ? undefined : (createFoodLogDto.totalFat != null ? Number(createFoodLogDto.totalFat) : undefined),
      totalCarbs: isFatSecretFood ? undefined : (createFoodLogDto.totalCarbs != null ? Number(createFoodLogDto.totalCarbs) : undefined),
      mealType: rawMealType,
    };

    const result = await this.prisma.foodLog.create({ data });
    if (!result) {
      throw new InternalServerErrorException('An error occurred while creating the FoodLog.');
    }
    return { message: 'New FoodLog has been created successfully.', data: result };
  }

  /**
   * Help to fetch food data from External API(FatSecret) such as food name, portion, and macro totals by using the fatsecretFoodId and fatsecretServingId that store on Database.
   * Because the data such as foodName, servingSize, servingUnit, caloriesPerServing, protein, carbs, and fat will be populated in the response payload, cant store permanently on Database due to the FatSecret Terms&Conditions. 
   */
  private async enrichLogsWithFoodDetails(logs: any[]) {
    return Promise.all(
      logs.map(async (log) => {
        // 1. Check if it's a External API(FatSecret) log with no local DB food:
        if (!log.food && log.fatsecretFoodId) {
          try {
            // 2. Pull the food data from the 24-hour Server RAM Cache:
            const fatsecretFood: any = await this.fatsecretService.getFoodById(log.fatsecretFoodId);
            if (fatsecretFood) {
              const rawServings = fatsecretFood.servings?.serving;
              const servingsList = Array.isArray(rawServings)
                ? rawServings
                : rawServings
                  ? [rawServings]
                  : [];
              // 3. Find the serving that matches fatsecretServingId
              const matchedServing =
                servingsList.find((s: any) => String(s.serving_id) === String(log.fatsecretServingId)) ||
                servingsList[0];

              const servingAmount = matchedServing ? parseFloat(matchedServing.metric_serving_amount || '1') || 1 : 1;
              const servingDesc = matchedServing
                ? matchedServing.serving_description || matchedServing.measurement_description || 'serving'
                : 'serving';

              const unitCalories = matchedServing ? Math.round(parseFloat(matchedServing.calories || '0')) : 0;
              const unitProtein = matchedServing ? parseFloat(matchedServing.protein || '0') : 0;
              const unitCarbs = matchedServing ? parseFloat(matchedServing.carbohydrate || '0') : 0;
              const unitFat = matchedServing ? parseFloat(matchedServing.fat || '0') : 0;

              const qty = Number(log.quantity) || 1;

              // 4. Construct the "food" object in RAM for response payload
              log.food = {
                foodId: log.fatsecretFoodId,
                foodName: fatsecretFood.food_name || 'Verified Food',
                servingSize: servingAmount,
                servingUnit: servingDesc,
                caloriesPerServing: unitCalories,
                protein: unitProtein,
                carbs: unitCarbs,
                fat: unitFat,
              };

              // 5. Calculate total macros in RAM based on user's quantity
              log.totalCalories = Math.round(unitCalories * qty);
              log.totalProtein = Number((unitProtein * qty).toFixed(1));
              log.totalCarbs = Number((unitCarbs * qty).toFixed(1));
              log.totalFat = Number((unitFat * qty).toFixed(1));
            }
          } catch (err) {
            // 6. Graceful fallback if external lookup is unavailable
            log.food = {
              foodId: log.fatsecretFoodId,
              foodName: 'Verified Food Item',
              servingSize: 1,
              servingUnit: 'serving',
              caloriesPerServing: 0,
              protein: 0,
              carbs: 0,
              fat: 0,
            };
          }
        }
        return log;
      })
    );
  }

  /**
   * Unified Query Method
   * Handles:
   * 1. All system logs (no filter)
   * 2. Logs filtered by userId
   * 3. Logs filtered by date (24-hour day window)
   * 4. Logs filtered by both date AND userId
   */
  async findAll(params: { date?: string; userId?: string; timezoneOffset?: string } = {}) {
    const { date, userId, timezoneOffset = '+07:00' } = params;
    const where: any = {};

    // 1. Filter by userId if provided
    if (userId) {
      where.userId = userId;
    }

    // 2. Filter by date window (24h in user's timezone) if provided
    if (date) {
      const startOfDay = new Date(`${date}T00:00:00.000${timezoneOffset}`);
      const endOfDay = new Date(`${date}T23:59:59.999${timezoneOffset}`);
      where.createdAt = {
        gte: startOfDay,
        lte: endOfDay,
      };
    }

    // 3. Single unified Prisma query
    const result = await this.prisma.foodLog.findMany({
      where,
      include: { user: true, food: true },
      orderBy: { createdAt: 'asc' },
    });

    if (!result) {
      throw new NotFoundException('No FoodLogs found matching the specified criteria.');
    }

    const enriched = await this.enrichLogsWithFoodDetails(result);

    const filterDescription = date && userId
      ? `FoodLogs for user:${userId} on date:${date}`
      : date
      ? `FoodLogs for date:${date}`
      : userId
      ? `FoodLogs for user:${userId}`
      : 'All FoodLogs';

    return {
      message: `${filterDescription} have been retrieved successfully.`,
      data: enriched,
    };
  }



  async findOne(id: string) {
    const result = await this.prisma.foodLog.findUnique({
      where: { foodLogId: id },
      include: { user: true, food: true },
    });
    if (!result) {
      throw new NotFoundException(`FoodLog id:${id} not found.`);
    }
    const enriched = (await this.enrichLogsWithFoodDetails([result]))[0];
    return { message: `FoodLog id:${id} has been retrieved successfully.`, data: enriched };
  }


  async update(id: string, updateFoodLogDto: UpdateFoodLogDto) {
    const data: any = { ...updateFoodLogDto };
    if (updateFoodLogDto.mealType) {
      data.mealType = String(updateFoodLogDto.mealType).toUpperCase() as MealType;
    }
    const result = await this.prisma.foodLog.update({
      where: { foodLogId: id },
      data,
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
