import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateFoodDto {
  @ApiProperty({ description: 'Name of the food item or recipe', example: 'Grilled Salmon Fillet' })
  foodName: string;

  @ApiProperty({ description: 'Calories per serving (in kcal)', example: 208 })
  caloriesPerServing: number;

  @ApiProperty({ description: 'Serving portion size numerical amount', example: 100 })
  servingSize: number;

  @ApiProperty({ description: 'Serving portion measurement unit (e.g. gram, cup, piece)', example: 'gram' })
  servingUnit: string;

  @ApiProperty({ description: 'Protein content in grams per serving', example: 22.5 })
  protein: number;

  @ApiProperty({ description: 'Fat content in grams per serving', example: 12.0 })
  fat: number;

  @ApiProperty({ description: 'Carbohydrate content in grams per serving', example: 0.0 })
  carbs: number;

  @ApiPropertyOptional({ description: 'Food category label (e.g. Seafood, Bakery, Dairy)', example: 'Seafood' })
  category?: string;

  @ApiPropertyOptional({ description: 'URL link to food photograph', example: 'https://example.com/salmon.jpg' })
  imageUrl?: string;
}