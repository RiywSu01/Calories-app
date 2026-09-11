import {
  FatSecretSearchResponse,
  FatSecretFoodDetail,
  CustomFoodInput,
  CustomFoodItem,
  CreateFoodLogPayload,
  FoodLogRecord,
  AIAnalysisResult,
} from '@/app/lib/types';


const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

// ============================================================
// Helper to build auth headers
// ============================================================
function getAuthHeaders(token?: string | null): HeadersInit {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

// ============================================================
// 1. FatSecret Public API Endpoints (Cached in NestJS RAM)
// ============================================================
// Search FatSecret food catalog (24h cached on backend)
// GET /foods/search?query=...&page=...&maxResults=...

export async function searchFatSecretFoods(
  query: string,
  page: number = 0,
  maxResults: number = 20,
  token?: string | null
): Promise<FatSecretSearchResponse> {
  if (!query || query.trim().length === 0) {
    return { foods: [], max_results: maxResults, page_number: page, total_results: 0 };
  }

  const endpoint = `${API_BASE_URL}/foods/search?query=${encodeURIComponent(
    query.trim()
  )}&page=${page}&maxResults=${maxResults}`;

  const response = await fetch(endpoint, {
    method: 'GET',
    headers: getAuthHeaders(token),
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    throw new Error(errorBody.message || `Failed to search foods (${response.status})`);
  }

  return response.json();
}

/**
 * Get detailed food nutritional facts and serving sizes by FatSecret Food ID
 * GET /foods/external/:id
 */
export async function getFatSecretFoodDetail(
  foodId: string,
  token?: string | null
): Promise<FatSecretFoodDetail> {
  const response = await fetch(`${API_BASE_URL}/foods/external/${foodId}`, {
    method: 'GET',
    headers: getAuthHeaders(token),
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    throw new Error(errorBody.message || `Failed to load food details (${response.status})`);
  }

  return response.json();
}

// ============================================================
// 2. Customize User's Food Database Endpoints (PostgreSQL)
// ============================================================

/**
 * Get all custom foods from database
 * GET /foods
 */
export async function getCustomFoods(token?: string | null): Promise<CustomFoodItem[]> {
  const response = await fetch(`${API_BASE_URL}/foods`, {
    method: 'GET',
    headers: getAuthHeaders(token),
  });

  if (!response.ok) {
    if (response.status === 404) return [];
    const errorBody = await response.json().catch(() => ({}));
    throw new Error(errorBody.message || `Failed to fetch custom foods (${response.status})`);
  }

  const result = await response.json();
  return result?.data ?? result ?? [];
}

/**
 * Create a new custom food item in database
 * POST /foods
 */
export async function createCustomFood(
  payload: CustomFoodInput,
  token: string | null
): Promise<CustomFoodItem> {
  const response = await fetch(`${API_BASE_URL}/foods`, {
    method: 'POST',
    headers: getAuthHeaders(token),
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    throw new Error(errorBody.message || `Failed to create custom food (${response.status})`);
  }

  const result = await response.json();
  return result?.data ?? result;
}

// ============================================================
// 3. Food Log Diary Entries (PostgreSQL)
// ============================================================

/**
 * Log a meal item to today's diary
 * POST /food-logs
 */
export async function logFoodToMeal(
  payload: CreateFoodLogPayload,
  token: string | null
): Promise<FoodLogRecord> {
  const response = await fetch(`${API_BASE_URL}/food-logs`, {
    method: 'POST',
    headers: getAuthHeaders(token),
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    throw new Error(errorBody.message || `Failed to log meal (${response.status})`);
  }

  const result = await response.json();
  return result?.data ?? result;
}

/**
 * Delete a food log entry from PostgreSQL
 * DELETE /food-logs/:id
 */
export async function deleteFoodLog(
  foodLogId: string,
  token: string | null
): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/food-logs/${foodLogId}`, {
    method: 'DELETE',
    headers: getAuthHeaders(token),
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    throw new Error(errorBody.message || `Failed to delete food log (${response.status})`);
  }
}


// ============================================================
// 4. AI Food Analysis (Zero-Storage Multimodal Vision AI - Gemini 3.6 Flash)
// ============================================================
/**
 * Analyze food via Zero-Storage Multimodal Vision AI
 * POST /foods/ai-analyze
 */
export async function analyzeFoodWithAI(
  payload: {
    prompt?: string;
    imageBase64?: string;
    mimeType?: string;
  },
  token?: string | null
): Promise<AIAnalysisResult> {
  const response = await fetch(`${API_BASE_URL}/foods/ai-analyze`, {
    method: 'POST',
    headers: getAuthHeaders(token),
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    throw new Error(errorBody.message || `AI Food Analysis failed (${response.status})`);
  }

  return response.json();
}


