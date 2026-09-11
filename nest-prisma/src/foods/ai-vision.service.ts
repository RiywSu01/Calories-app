import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import {
  AnalyzeFoodDto,
  AIAnalysisResult,
  GeminiRecognitionOutput,
} from './dto/analyze-food.dto';
import { FatSecretService } from './fatsecret.service';

export { AnalyzeFoodDto, AIAnalysisResult, GeminiRecognitionOutput };

@Injectable()

export class AiVisionService {
  private readonly logger = new Logger(AiVisionService.name);

  constructor(private readonly fatSecretService: FatSecretService) { }

  /**
   * Analyzes food from an image (zero-storage) or text prompt using Google Gemini 3.6 Flash Vision,
   * extracts `foodName` and `thinking`, then queries FatSecret for verified nutritional items.
   */
  async analyzeFood(dto: AnalyzeFoodDto): Promise<AIAnalysisResult> {
    const { prompt, imageBase64, mimeType = 'image/jpeg' } = dto;

    // Check if prompt and imageBase64 are empty or not
    if (!prompt?.trim() && !imageBase64?.trim()) {
      throw new BadRequestException('Please provide either a photo or a meal description to analyze.');
    }

    const apiKey = process.env.GEMINI_API_KEY || process.env.GEMINI_KEY;

    // If API key is provided, use Google Gemini 3.6 Flash
    if (apiKey && apiKey !== 'your_gemini_api_key_here') {
      try {
        // 1. Identify foodName, thinking explanation, and confidenceScore from Gemini Vision
        const geminiOutput = await this.callGeminiVision(apiKey, prompt, imageBase64, mimeType);

        if (!geminiOutput.foodName?.trim()) {
          return this.fallbackAnalysis(
            prompt,
            'Sorry, no food could be identified in this image. Please try taking a clearer photo with better lighting or enter the food name manually.'
          );
        }

        this.logger.log(`Gemini identified food: "${geminiOutput.foodName}" with thinking: "${geminiOutput.thinking}"`);

        // 2. Query FatSecret database for verified foods and serving macros
        const searchResult: any = await this.fatSecretService.searchFoods(geminiOutput.foodName.trim(), 0, 15);

        return {
          rawPrompt: prompt || 'Photo Analysis',
          foodName: geminiOutput.foodName,
          thinking: geminiOutput.thinking,
          confidenceScore: geminiOutput.confidenceScore,
          foods: searchResult?.foods || [],
          totalResults: searchResult?.total_results || 0,
        };

      } catch (err: any) {
        this.logger.error(`Gemini Vision API error or FatSecret API error: ${err.message}`, err.stack);
        return this.fallbackAnalysis(
          prompt,
          'Sorry, the AI was unable to analyze your meal at this time. Please try taking a clearer photo or enter your meal manually.'
        );
      }
    }

    // If no key is configured
    this.logger.warn('GEMINI_API_KEY not configured.');
    return this.fallbackAnalysis(
      prompt,
      'Sorry, AI meal analysis is currently unavailable because the API key is not configured.'
    );
  }

  /**
   * Calls Google Gemini 3.6 Flash REST endpoint with Multimodal inputs (Zero-Storage)
   * Using Method: models.generateContent
   */
  private async callGeminiVision(
    apiKey: string,
    prompt?: string,
    imageBase64?: string,
    mimeType: string = 'image/jpeg'
  ): Promise<GeminiRecognitionOutput> {
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=${apiKey}`;

    const parts: any[] = [];

    // System instruction prompt
    const systemPrompt = `
You are an expert visual food recognition AI.
Analyze the user's meal photo and/or description.
Identify the primary food item shown.
Return ONLY a valid JSON object matching this exact structure:
{
  "foodName": "string (concise food name keyword to search, e.g. 'Salmon Fillet', 'Chicken Breast', 'Pad Thai', 'Avocado Toast', 'Apple')",
  "thinking": "This is [food name] because [the visual cues, ingredients, textures, colors, or cooking style you observed], [Picture details explain including quantity of food you see on the image, e.g. I see 1 medium salmon fillet garnished with dill and lemon slice]",
  "confidenceScore": number (between 0.0 and 1.0, e.g. 0.95)
}

Rules:
1. The thinking value MUST start with: "This is [food name] because ..."
2. Followed by the reason why you think so, and then the picture details explaining what and how much you see on the plate.
3. Do NOT include any markdown codeblocks (\`\`\`json) or conversational text outside the JSON object.
`;

    parts.push({
      text: `${systemPrompt}\nUser Notes: ${prompt?.trim() || 'Analyze the food shown in the image.'}`,
    });

    // Clean and attach inline image if provided
    if (imageBase64) {
      const cleanBase64 = imageBase64.includes(',') ? imageBase64.split(',')[1] : imageBase64;

      parts.push({
        inline_data: {
          mime_type: mimeType,
          data: cleanBase64,
        },
      });
    }

    const requestBody = {
      contents: [
        {
          parts,
        },
      ],
      generationConfig: {
        response_mime_type: 'application/json',
        temperature: 0.2,
      },
    };

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Gemini API returned status ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!rawText) {
      throw new Error('Empty response received from Gemini Vision API.');
    }

    // Clean potential markdown backticks
    const cleanedJson = rawText.replace(/^```json\s*/i, '').replace(/\s*```$/i, '').trim();
    const parsed = JSON.parse(cleanedJson);

    return {
      foodName: String(parsed.foodName || '').trim(),
      thinking: String(parsed.thinking || '').trim(),
      confidenceScore: Math.min(Math.max(Number(parsed.confidenceScore) || 0.9, 0.0), 1.0),
    };
  }

  /**
   * Fallback response when AI recognition fails or GEMINI_API_KEY is not configured
   */
  private fallbackAnalysis(prompt?: string, message?: string): AIAnalysisResult {
    return {
      rawPrompt: prompt || 'Photo Analysis',
      foodName: '',
      thinking:
        message ||
        'Sorry, AI was unable to recognize the food in this request. Please try taking a clearer photo from another angle or search for the food manually.',
      confidenceScore: 0,
      foods: [],
      totalResults: 0,
    };
  }
}
