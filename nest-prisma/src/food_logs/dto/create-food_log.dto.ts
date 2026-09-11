import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { MealType } from '../../generated/prisma/enums';

export class CreateFoodLogDto {
  @ApiProperty({ description: 'Clerk User ID', example: 'user_3HiYHDqKiD1ZBevdfWANDSJ5Eph' })
  userId: string;

  @ApiPropertyOptional({ description: 'Foreign key to local foods table (for custom recipes)', example: 'f1111111-1111-1111-1111-111111111111' })
  foodId?: string;

  @ApiPropertyOptional({ description: 'FatSecret Cloud Food ID', example: '1641' })
  fatsecretFoodId?: string;

  @ApiPropertyOptional({ description: 'FatSecret Cloud Serving ID', example: '5023' })
  fatsecretServingId?: string;

  @ApiPropertyOptional({ description: 'FatSecret Food ID (snake_case alias)', example: '1641' })
  fatsecret_food_id?: string;

  @ApiPropertyOptional({ description: 'FatSecret Serving ID (snake_case alias)', example: '5023' })
  fatsecret_serving_id?: string;

  @ApiProperty({ description: 'Portion multiplier / serving quantity count', example: 1.5, default: 1 })
  quantity: number;

  @ApiPropertyOptional({ description: 'Total calories for custom items (optional for FatSecret items)', example: 295 })
  totalCalories?: number;

  @ApiPropertyOptional({ description: 'Total protein in grams for custom items', example: 45.0 })
  totalProtein?: number;

  @ApiPropertyOptional({ description: 'Total fat in grams for custom items', example: 11.5 })
  totalFat?: number;

  @ApiPropertyOptional({ description: 'Total carbs in grams for custom items', example: 0.0 })
  totalCarbs?: number;

  @ApiProperty({ enum: MealType, description: 'Meal slot category (BREAKFAST, LUNCH, DINNER)', example: MealType.LUNCH })
  mealType: MealType;
}



