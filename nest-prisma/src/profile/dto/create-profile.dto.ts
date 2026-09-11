import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ActivityLevelType, AuthProviderType, GenderType, GoalModeType } from '../../generated/prisma/enums';

export class CreateProfileDto {
  @ApiProperty({ description: 'Clerk User ID', example: 'user_3HiYHDqKiD1ZBevdfWANDSJ5Eph' })
  userId: string;

  @ApiPropertyOptional({ enum: AuthProviderType, description: 'Authentication method', default: AuthProviderType.Email, example: AuthProviderType.Email })
  authProvider?: AuthProviderType;

  @ApiPropertyOptional({ description: 'User height in centimeters', example: 175.5 })
  heightCm?: number;

  @ApiPropertyOptional({ description: 'User current weight in kilograms', example: 70.2 })
  weightKg?: number;

  @ApiPropertyOptional({ description: 'Date of birth (ISO 8601 string or Date)', example: '1998-05-15' })
  dateOfBirth?: Date | string;

  @ApiPropertyOptional({ enum: GenderType, description: 'User biological sex / gender', example: GenderType.male })
  gender?: GenderType;

  @ApiPropertyOptional({ enum: GoalModeType, description: 'Weight goal mode (lose, maintain, gain)', example: GoalModeType.lose })
  goalMode?: GoalModeType;

  @ApiPropertyOptional({ description: 'Daily target calorie goal in kcal', example: 2000 })
  targetCalories?: number;

  @ApiPropertyOptional({ description: 'Daily target protein goal in grams', example: 150 })
  targetProtein?: number;

  @ApiPropertyOptional({ description: 'Daily target fat goal in grams', example: 60 })
  targetFat?: number;

  @ApiPropertyOptional({ description: 'Daily target carbs goal in grams', example: 215 })
  targetCarbs?: number;

  @ApiPropertyOptional({ description: 'Protein intake in grams', example: 150 })
  proteinG?: number;

  @ApiPropertyOptional({ description: 'Fat intake in grams', example: 60 })
  fatG?: number;

  @ApiPropertyOptional({ description: 'Carbohydrate intake in grams', example: 215 })
  carbsG?: number;

  @ApiPropertyOptional({ enum: ActivityLevelType, description: 'Daily physical activity level', example: ActivityLevelType.moderate })
  activityLevel?: ActivityLevelType;

  @ApiPropertyOptional({ description: 'Calculated Basal Metabolic Rate in kcal', example: 1680.5 })
  bmr?: number;

  @ApiPropertyOptional({ description: 'Total Daily Energy Expenditure in kcal', example: 2350.0 })
  tdee?: number;

  @ApiPropertyOptional({ description: 'Body Mass Index score', example: 22.8 })
  bmi?: number;

  @ApiPropertyOptional({ description: 'BMI classification category', example: 'Normal weight' })
  bmiCategory?: string;
}
