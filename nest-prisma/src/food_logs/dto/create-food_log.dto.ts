import { MealType } from '../../generated/prisma/enums';

export class CreateFoodLogDto {
  userId: string;
  foodId: string;
  quantity: number;
  totalCalories?: number;
  totalProtein?: number;
  totalFat?: number;
  totalCarbs?: number;
  mealType: MealType;
}
