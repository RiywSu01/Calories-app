import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse, ApiQuery, ApiParam } from '@nestjs/swagger';
import { Throttle, SkipThrottle } from '@nestjs/throttler';
import { FoodsService } from './foods.service';
import { FatSecretService } from './fatsecret.service';
import { AiVisionService } from './ai-vision.service';
import { CreateFoodDto } from './dto/create-food.dto';
import { UpdateFoodDto } from './dto/update-food.dto';
import { AnalyzeFoodDto, AIAnalysisResult } from './dto/analyze-food.dto';
import { ClerkAuthGuard } from '../auth/clerk-auth.guard';

@ApiTags('Foods')
@Controller('foods')
export class FoodsController {
  constructor(
    private readonly foodsService: FoodsService,
    private readonly fatSecretService: FatSecretService,
    private readonly aiVisionService: AiVisionService,
  ) { }

  /**
   * AI Multimodal Food & Meal Analyzer (Zero-Storage Vision AI)
   * POST http://localhost:3001/foods/ai-analyze
   * Rate Limit: Max 1 req/sec, max 3 req/10s, max 10 req/min per IP
   */
  @Throttle({ short: { limit: 1, ttl: 1000 }, medium: { limit: 3, ttl: 10000 }, long: { limit: 10, ttl: 60000 } })
  @Post('ai-analyze')
  @ApiOperation({ summary: 'AI Multimodal Meal & Photo Analyzer', description: 'Uses Google Gemini 3.6 Flash to recognize food items and queries FatSecret database for verified nutritional details' })
  @ApiResponse({ status: 200, description: 'AI analysis results with matched food candidates', type: AIAnalysisResult })
  @ApiResponse({ status: 400, description: 'Missing image or prompt' })
  @ApiResponse({ status: 429, description: 'Rate limit exceeded (Max 10 calls/min)' })
  analyzeFoodWithAI(@Body() analyzeFoodDto: AnalyzeFoodDto) {
    return this.aiVisionService.analyzeFood(analyzeFoodDto);
  }

  /**
   * Search foods via FatSecret API (Public / 24h cache)
   * GET http://localhost:3001/foods/search?query=chicken&page=0
   * Rate Limit: Max 3 req/sec burst, max 10 req/10s, max 25 req/min per IP
   */
  @Throttle({ short: { limit: 3, ttl: 1000 }, medium: { limit: 10, ttl: 10000 }, long: { limit: 25, ttl: 60000 } })
  @Get('search')
  @ApiOperation({ summary: 'Search verified foods via FatSecret Platform API', description: 'Queries over 1M+ verified branded and generic foods with 24-hour in-memory cache' })
  @ApiQuery({ name: 'query', description: 'Food search keyword (e.g. chicken, apple, oatmeal)', example: 'chicken' })
  @ApiQuery({ name: 'page', required: false, description: 'Page number index (starts at 0)', example: '0' })
  @ApiQuery({ name: 'maxResults', required: false, description: 'Max items per page (default 20)', example: '20' })
  @ApiResponse({ status: 200, description: 'Search results returned from cache or FatSecret API' })
  @ApiResponse({ status: 429, description: 'Rate limit exceeded (Max 25 searches/min, burst 3/s)' })
  searchFoods(
    @Query('query') query: string,
    @Query('page') page?: string,
    @Query('maxResults') maxResults?: string
  ) {
    return this.fatSecretService.searchFoods(
      query,
      page ? parseInt(page, 10) : 0,
      maxResults ? parseInt(maxResults, 10) : 20
    );
  }

  /**
   * Get food details & serving macros from FatSecret by Food ID
   * GET http://localhost:3001/foods/external/:id
   * Rate Limit: Max 5 req/sec burst, max 15 req/10s, max 40 req/min per IP
   */
  @Throttle({ short: { limit: 5, ttl: 1000 }, medium: { limit: 15, ttl: 10000 }, long: { limit: 40, ttl: 60000 } })
  @Get('external/:id')
  @ApiOperation({ summary: 'Get complete food details and serving sizes from FatSecret', description: 'Fetches granular serving metrics and macro breakdowns by FatSecret foodId' })
  @ApiParam({ name: 'id', description: 'FatSecret unique food_id', example: '1641' })
  @ApiResponse({ status: 200, description: 'Detailed food nutrition and servings array' })
  @ApiResponse({ status: 404, description: 'Food item not found' })
  @ApiResponse({ status: 429, description: 'Rate limit exceeded (Max 40 calls/min)' })
  getExternalFood(@Param('id') id: string) {
    return this.fatSecretService.getFoodById(id);
  }

  /**
   * Inspect current in-memory cache data
   * GET http://localhost:3001/foods/cache-dump
   */
  @SkipThrottle()
  @Get('cache-dump')
  @ApiOperation({ summary: 'Inspect in-memory 24-hour cache state (Diagnostic)', description: 'Returns cached keys and data items currently stored in CacheModule RAM' })
  @ApiResponse({ status: 200, description: 'Cache dump diagnostic payload' })
  getCacheDump() {
    return this.fatSecretService.getCacheDump();
  }

  /**
   * Create custom food (Requires user authentication)
   */
  @ApiBearerAuth('clerk-auth')
  @UseGuards(ClerkAuthGuard)
  @Post()
  @ApiOperation({ summary: 'Create custom food recipe', description: 'Saves a homemade or custom recipe item in the database' })
  @ApiResponse({ status: 201, description: 'Custom food created successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized - Missing or invalid Clerk JWT' })
  create(@Body() createFoodDto: CreateFoodDto) {
    return this.foodsService.create(createFoodDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all custom food items', description: 'Retrieves all local custom foods stored in database' })
  @ApiResponse({ status: 200, description: 'Custom foods list retrieved successfully' })
  findAll() {
    return this.foodsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get custom food item by Food ID', description: 'Retrieves a single local custom food record by UUID' })
  @ApiParam({ name: 'id', description: 'Food UUID', example: 'f1111111-1111-1111-1111-111111111111' })
  @ApiResponse({ status: 200, description: 'Custom food item retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Custom food item not found' })
  findOne(@Param('id') id: string) {
    return this.foodsService.findOne(id);
  }

  @ApiBearerAuth('clerk-auth')
  @UseGuards(ClerkAuthGuard)
  @Patch('edit/:id')
  @ApiOperation({ summary: 'Update custom food recipe', description: 'Modifies fields of an existing custom food recipe' })
  @ApiParam({ name: 'id', description: 'Food UUID' })
  @ApiResponse({ status: 200, description: 'Custom food updated successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Custom food not found' })
  update(@Param('id') id: string, @Body() updateFoodDto: UpdateFoodDto) {
    return this.foodsService.update(id, updateFoodDto);
  }

  @ApiBearerAuth('clerk-auth')
  @UseGuards(ClerkAuthGuard)
  @Delete('remove/:id')
  @ApiOperation({ summary: 'Delete custom food recipe', description: 'Removes a custom food recipe from database' })
  @ApiParam({ name: 'id', description: 'Food UUID' })
  @ApiResponse({ status: 200, description: 'Custom food removed successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Custom food not found' })
  remove(@Param('id') id: string) {
    return this.foodsService.remove(id);
  }
}


