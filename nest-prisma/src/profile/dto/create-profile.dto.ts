import { ActivityLevelType, AuthProviderType, GenderType } from '../../generated/prisma/enums';

export class CreateProfileDto {
  userId: string;
  authProvider: AuthProviderType;
  heightCm?: number;
  weightKg?: number;
  dateOfBirth?: Date | string;
  gender?: GenderType;
  targetCalories?: number;
  targetProtein?: number;
  targetFat?: number;
  targetCarbs?: number;
  activityLevel?: ActivityLevelType;
  bmr?: number;
  tdee?: number;
}
