export class CreateFoodDto {
  foodName: string;
  caloriesPerServing: number;
  servingSize: number;
  servingUnit: string;
  protein: number;
  fat: number;
  carbs: number;
  category?: string;
  imageUrl?: string;
}