export class CreateFoodDto {
  food_name: string;
  calories_per_serving: number;
  serving_size: string;
  protein?: number;
  fat?: number;
  carbs?: number;
  category?: string;
  image_url?: string;
}