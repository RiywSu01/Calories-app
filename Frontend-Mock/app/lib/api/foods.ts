import {
  FatSecretSearchResponse,
  FatSecretFoodDetail,
  CustomFoodInput,
  CustomFoodItem,
  CreateFoodLogPayload,
  FoodLogRecord,
  AIAnalysisResult,
} from '@/app/lib/types';
import { demoStore, isDemoMode } from './demoStore';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

function getAuthHeaders(token?: string | null): HeadersInit {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

// ─── 1. Food Catalog Search ───
export async function searchFatSecretFoods(
  query: string,
  page: number = 0,
  maxResults: number = 20,
  token?: string | null
): Promise<FatSecretSearchResponse> {
  if (!query || query.trim().length === 0) {
    return { foods: [], max_results: maxResults, page_number: page, total_results: 0 };
  }

  if (isDemoMode()) {
    return demoStore.searchFoods(query, page, maxResults);
  }

  try {
    const endpoint = `${API_BASE_URL}/foods/search?query=${encodeURIComponent(
      query.trim()
    )}&page=${page}&maxResults=${maxResults}`;

    const response = await fetch(endpoint, {
      method: 'GET',
      headers: getAuthHeaders(token),
    });

    if (!response.ok) {
      return demoStore.searchFoods(query, page, maxResults);
    }

    return response.json();
  } catch (err) {
    return demoStore.searchFoods(query, page, maxResults);
  }
}

export async function getFatSecretFoodDetail(
  foodId: string,
  token?: string | null
): Promise<FatSecretFoodDetail> {
  if (isDemoMode() || foodId.startsWith('demo-')) {
    return demoStore.getFoodDetail(foodId);
  }

  try {
    const response = await fetch(`${API_BASE_URL}/foods/external/${foodId}`, {
      method: 'GET',
      headers: getAuthHeaders(token),
    });

    if (!response.ok) {
      return demoStore.getFoodDetail(foodId);
    }

    return response.json();
  } catch (err) {
    return demoStore.getFoodDetail(foodId);
  }
}

// ─── 2. Custom User Foods ───
export async function getCustomFoods(token?: string | null): Promise<CustomFoodItem[]> {
  if (isDemoMode()) {
    return demoStore.getCustomFoods();
  }

  try {
    const response = await fetch(`${API_BASE_URL}/foods`, {
      method: 'GET',
      headers: getAuthHeaders(token),
    });

    if (!response.ok) {
      return demoStore.getCustomFoods();
    }

    const result = await response.json();
    return result?.data ?? result ?? [];
  } catch (err) {
    return demoStore.getCustomFoods();
  }
}

export async function createCustomFood(
  payload: CustomFoodInput,
  token: string | null
): Promise<CustomFoodItem> {
  if (isDemoMode()) {
    return demoStore.createCustomFood(payload);
  }

  try {
    const response = await fetch(`${API_BASE_URL}/foods`, {
      method: 'POST',
      headers: getAuthHeaders(token),
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      return demoStore.createCustomFood(payload);
    }

    const result = await response.json();
    return result?.data ?? result;
  } catch (err) {
    return demoStore.createCustomFood(payload);
  }
}

// ─── 3. Food Diary Entries ───
export async function logFoodToMeal(
  payload: CreateFoodLogPayload,
  token: string | null
): Promise<FoodLogRecord> {
  if (isDemoMode()) {
    return demoStore.addLog(payload);
  }

  try {
    const response = await fetch(`${API_BASE_URL}/food-logs`, {
      method: 'POST',
      headers: getAuthHeaders(token),
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      return demoStore.addLog(payload);
    }

    const result = await response.json();
    return result?.data ?? result;
  } catch (err) {
    return demoStore.addLog(payload);
  }
}

export async function deleteFoodLog(
  foodLogId: string,
  token: string | null
): Promise<void> {
  if (isDemoMode()) {
    demoStore.deleteLog(foodLogId);
    return;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/food-logs/${foodLogId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(token),
    });

    if (!response.ok) {
      demoStore.deleteLog(foodLogId);
    }
  } catch (err) {
    demoStore.deleteLog(foodLogId);
  }
}

// ─── 4. Zero-Storage AI Vision Simulation ───
export async function analyzeFoodWithAI(
  payload: {
    prompt?: string;
    imageBase64?: string;
    mimeType?: string;
  },
  token?: string | null
): Promise<AIAnalysisResult> {
  if (isDemoMode()) {
    return demoStore.analyzeFoodWithAI(payload);
  }

  try {
    const response = await fetch(`${API_BASE_URL}/foods/ai-analyze`, {
      method: 'POST',
      headers: getAuthHeaders(token),
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      return demoStore.analyzeFoodWithAI(payload);
    }

    return response.json();
  } catch (err) {
    return demoStore.analyzeFoodWithAI(payload);
  }
}
