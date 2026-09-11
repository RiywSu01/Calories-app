import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse, ApiQuery, ApiParam } from '@nestjs/swagger';
import { FoodLogsService } from './food_logs.service';
import { CreateFoodLogDto } from './dto/create-food_log.dto';
import { UpdateFoodLogDto } from './dto/update-food_log.dto';
import { ClerkAuthGuard } from '../auth/clerk-auth.guard';

@ApiTags('Food Logs')
@ApiBearerAuth('clerk-auth')
@UseGuards(ClerkAuthGuard)
@Controller('food-logs')
export class FoodLogsController {
  constructor(private readonly foodLogsService: FoodLogsService) { }

  @Post()
  @ApiOperation({ summary: 'Log a food entry to diary', description: 'Records a meal item (either custom food or FatSecret verified food ID) into the user diary' })
  @ApiResponse({ status: 201, description: 'Food log created successfully' })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  create(@Body() createFoodLogDto: CreateFoodLogDto) {
    return this.foodLogsService.create(createFoodLogDto);
  }

  /**
   * Unified GET /food-logs
   * Handles:
   * 1. GET /food-logs                             (All logs in the system)
   * 2. GET /food-logs?userId=user_123             (User's all history)
   * 3. GET /food-logs?date=2026-08-23             (All logs on date across system)
   * 4. GET /food-logs?date=2026-08-23&userId=...  (User's logs on specific date)
   */
  @Get()
  @ApiOperation({ summary: 'Query food diary logs with automatic 24h nutrition hydration', description: 'Fetches food diary entries for a given date, user, or date range. Automatically populates FatSecret cloud food details from 24h cache in compliance with ToS.' })
  @ApiQuery({ name: 'date', required: false, description: 'Calendar date filter (YYYY-MM-DD)', example: '2026-08-31' })
  @ApiQuery({ name: 'userId', required: false, description: 'Clerk User ID filter', example: 'user_3HiYHDqKiD1ZBevdfWANDSJ5Eph' })
  @ApiQuery({ name: 'timezoneOffset', required: false, description: 'Timezone offset in minutes (e.g. -420 for UTC+7)', example: '-420' })
  @ApiResponse({ status: 200, description: 'Hydrated list of food log entries with calculated calories and macronutrients' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  findAll(
    @Query('date') date?: string,
    @Query('userId') userId?: string,
    @Query('timezoneOffset') timezoneOffset?: string,
  ) {
    return this.foodLogsService.findAll({ date, userId, timezoneOffset });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get single food log entry by UUID', description: 'Retrieves a single food log entry with complete hydrated nutrition' })
  @ApiParam({ name: 'id', description: 'Food log UUID' })
  @ApiResponse({ status: 200, description: 'Food log retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Food log not found' })
  findOne(@Param('id') id: string) {
    return this.foodLogsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update food log entry (e.g. portion quantity or meal slot)', description: 'Modifies logged food portion quantity or meal type' })
  @ApiParam({ name: 'id', description: 'Food log UUID' })
  @ApiResponse({ status: 200, description: 'Food log updated successfully' })
  @ApiResponse({ status: 404, description: 'Food log not found' })
  update(@Param('id') id: string, @Body() updateFoodLogDto: UpdateFoodLogDto) {
    return this.foodLogsService.update(id, updateFoodLogDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete food log entry from diary', description: 'Removes a logged food entry from database' })
  @ApiParam({ name: 'id', description: 'Food log UUID' })
  @ApiResponse({ status: 200, description: 'Food log removed successfully' })
  @ApiResponse({ status: 404, description: 'Food log not found' })
  remove(@Param('id') id: string) {
    return this.foodLogsService.remove(id);
  }
}
