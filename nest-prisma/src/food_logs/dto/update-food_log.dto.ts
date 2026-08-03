import { PartialType } from '@nestjs/mapped-types';
import { CreateFoodLogDto } from './create-food_log.dto';

export class UpdateFoodLogDto extends PartialType(CreateFoodLogDto) {}
