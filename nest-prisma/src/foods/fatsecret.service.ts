import { Injectable, Inject, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';

interface FatSecretTokenResponse {
  access_token: string;
  expires_in: number;
  token_type: string;
  scope: string;
}

export interface FatSecretFoodSearchResult {
  food_id: string;
  food_name: string;
  food_type: string;
  food_description: string;
  food_url?: string;
  brand_name?: string;
}

@Injectable()
export class FatSecretService {
  private readonly logger = new Logger(FatSecretService.name);

  // 24 hours TTL in milliseconds (ToS Section 1.5 Compliant)
  private readonly CACHE_TTL_24H = 24 * 60 * 60 * 1000;

  constructor(
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache
  ) {}

  // 1. Obtain and cache OAuth 2.0 Bearer Token (24h lifespan managed via CacheModule)
  async getAccessToken(): Promise<string> {
    const tokenCacheKey = 'fatsecret:oauth_token';

    // 1. Check if token is already in cache
    const cachedToken = await this.cacheManager.get<string>(tokenCacheKey);
    if (cachedToken) {
      return cachedToken;
    }

    // 2. If token is expired or not in cache, refresh it
    const clientId = process.env.FATSECRET_CLIENT_ID;
    const clientSecret = process.env.FATSECRET_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      throw new HttpException(
        'FatSecret API credentials are not configured in environment variables.',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }

    const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

    try {
      const response = await fetch('https://oauth.fatsecret.com/connect/token', {
        method: 'POST',
        headers: {
          Authorization: `Basic ${credentials}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: 'grant_type=client_credentials&scope=basic',
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`OAuth error: ${response.status} - ${errText}`);
      }

      const data: FatSecretTokenResponse = await response.json();

      // Refresh 5 minutes before actual token expiry (in milliseconds)
      const tokenTtlMs = Math.max(1000, (data.expires_in - 300) * 1000);
      await this.cacheManager.set(tokenCacheKey, data.access_token, tokenTtlMs);

      this.logger.log('Successfully refreshed FatSecret OAuth 2.0 Access Token via CacheModule.');
      return data.access_token;
    } catch (error) {
      this.logger.error('Failed to obtain FatSecret OAuth token', error);
      throw new HttpException(
        'Failed to authenticate with FatSecret API.',
        HttpStatus.BAD_GATEWAY
      );
    }
  }

  // 2. Search Foods by Keyword with 24-hour cache (via CacheModule)
  async searchFoods(query: string, pageNumber: number = 0, maxResults: number = 20) {
    if (!query || query.trim().length === 0) {
      return { foods: [], total_results: 0 };
    }

    const cacheKey = `fatsecret:search:${query.toLowerCase().trim()}:${pageNumber}:${maxResults}`;

    // 1. Check CacheModule
    const cached = await this.cacheManager.get(cacheKey);
    if (cached) {
      return cached;
    }

    // 2. Fetch from FatSecret API
    const token = await this.getAccessToken();
    const endpoint = `https://platform.fatsecret.com/rest/server.api?method=foods.search&search_expression=${encodeURIComponent(
      query.trim()
    )}&page_number=${pageNumber}&max_results=${maxResults}&format=json`;

    try {
      const response = await fetch(endpoint, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();

      if (result.error) {
        this.logger.warn(`FatSecret search error (${result.error.code}): ${result.error.message}`);
        throw new HttpException(result.error.message, HttpStatus.BAD_REQUEST);
      }

      // Format response cleanly
      const foodsArray = result?.foods?.food
        ? Array.isArray(result.foods.food)
          ? result.foods.food
          : [result.foods.food]
        : [];

      const formattedResult = {
        foods: foodsArray,
        max_results: Number(result?.foods?.max_results ?? maxResults),
        page_number: Number(result?.foods?.page_number ?? pageNumber),
        total_results: Number(result?.foods?.total_results ?? foodsArray.length),
      };

      // 3. Save to CacheModule with 24h TTL (86,400,000 ms) in accordance with Section 1.5
      await this.cacheManager.set(cacheKey, formattedResult, this.CACHE_TTL_24H);

      return formattedResult;
    } catch (error) {
      if (error instanceof HttpException) throw error;
      this.logger.error(`Food search query failed for '${query}'`, error);
      throw new HttpException('Food search service failed', HttpStatus.BAD_GATEWAY);
    }
  }

  // 3. Get Complete Food & Serving Macros by Food ID (via CacheModule)
  async getFoodById(foodId: string) {
    if (!foodId) {
      throw new HttpException('Food ID is required.', HttpStatus.BAD_REQUEST);
    }

    const cacheKey = `fatsecret:food:${foodId}`;

    // 1. Check CacheModule
    const cached = await this.cacheManager.get(cacheKey);
    if (cached) {
      return cached;
    }

    // 2. Fetch from FatSecret API
    const token = await this.getAccessToken();
    const endpoint = `https://platform.fatsecret.com/rest/server.api?method=food.get.v4&food_id=${foodId}&format=json`;

    try {
      const response = await fetch(endpoint, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();

      if (result.error) {
        this.logger.warn(`FatSecret food detail error (${result.error.code}): ${result.error.message}`);
        throw new HttpException(result.error.message, HttpStatus.BAD_REQUEST);
      }

      // Response structure from FatSecret API => { food: { ... } }
      const foodData = result?.food ?? result;

      // 3. Save to CacheModule with 24h TTL
      await this.cacheManager.set(cacheKey, foodData, this.CACHE_TTL_24H);

      return foodData;
    } catch (error) {
      if (error instanceof HttpException) throw error;
      this.logger.error(`Failed to fetch food details for ID: ${foodId}`, error);
      throw new HttpException('Failed to retrieve food details', HttpStatus.BAD_GATEWAY);
    }
  }

  // 4. Debug helper to inspect in-memory cache contents
  async getCacheDump() {
    try {
      const cm: any = this.cacheManager;
      const memStore: any = cm?.stores?.[0];

      const keys: string[] = [];
      const cacheData: Record<string, any> = {};

      if (typeof memStore?.iterator === 'function') {
        for await (const [key, value] of memStore.iterator()) {
          keys.push(key);
          cacheData[key] = value;
        }
      } else if (memStore?._store instanceof Map) {
        for (const [key, value] of memStore._store.entries()) {
          keys.push(key);
          cacheData[key] = value;
        }
      }

      return {
        totalKeys: keys.length,
        keys,
        cacheData,
      };
    } catch (err: any) {
      return { error: err.message };
    }
  }
}





