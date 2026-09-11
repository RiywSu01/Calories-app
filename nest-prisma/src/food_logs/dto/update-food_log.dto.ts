import { PartialType } from '@nestjs/swagger';
import { CreateFoodLogDto } from './create-food_log.dto';

export class UpdateFoodLogDto extends PartialType(CreateFoodLogDto) {}
