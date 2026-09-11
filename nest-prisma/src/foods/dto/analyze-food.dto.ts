import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AnalyzeFoodDto {
  @ApiPropertyOptional({ description: 'Text description of the meal or food query', example: 'A plate of chicken breast with white rice and steamed broccoli' })
  prompt?: string;

  @ApiPropertyOptional({ description: 'Base64 encoded meal photo data (e.g. data:image/jpeg;base64,...)', example: 'data:image/jpeg;base64,/9j/4AAQSkZJRg...' })
  imageBase64?: string;

  @ApiPropertyOptional({ description: 'MIME type of the photo uploaded', example: 'image/jpeg', default: 'image/jpeg' })
  mimeType?: string;
}

export class GeminiRecognitionOutput {
  @ApiProperty({ description: 'Predicted concise food name for database lookup', example: 'Grilled Chicken Breast' })
  foodName: string;

  @ApiProperty({ description: 'AI visual reasoning and portion estimation explanation', example: 'Identified grilled poultry texture with approx. 150g portion size' })
  thinking: string;

  @ApiProperty({ description: 'Confidence score of the identification (0.0 to 1.0)', example: 0.96 })
  confidenceScore: number;
}

export class AIAnalysisResult {
  @ApiProperty({ description: 'Original user prompt or photo analysis label', example: 'Photo Analysis' })
  rawPrompt: string;

  @ApiProperty({ description: 'Primary identified food item keyword', example: 'Grilled Chicken' })
  foodName: string;

  @ApiProperty({ description: 'AI thinking breakdown explaining identified ingredients', example: 'This is Grilled Chicken because of visible grill marks and lean texture.' })
  thinking: string;

  @ApiProperty({ description: 'Confidence score (0.0 - 1.0)', example: 0.95 })
  confidenceScore: number;

  @ApiProperty({ description: 'Array of verified matching items from FatSecret API', example: [] })
  foods: any[];

  @ApiProperty({ description: 'Total matched results in FatSecret food database', example: 12 })
  totalResults: number;
}
