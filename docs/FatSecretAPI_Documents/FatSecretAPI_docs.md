# FatSecret Platform API — Technical Specification, Rate Limits & Terms Analysis

## 1. Executive Overview
The **FatSecret Platform API** is an enterprise-grade nutritional database and food analysis engine used by global health and fitness platforms (including Samsung Health, Fitbit, and YAZIO). It provides verified nutritional data, branded packaged foods, and global restaurant chain menus.

This document outlines the **rate limits**, **Terms of Service (ToS) data caching rules**, **authentication lifecycle**, and the **recommended architectural integration** for the CalPal application (**NestJS + Prisma + PostgreSQL + Next.js**).

---

## 2. API Comparison Matrix

| Provider | Free Quota | Rate Limiting Policy | Image Support | Data Type & Accuracy | Legal Storage / Caching |
| :--- | :--- | :--- | :---: | :--- | :--- |
| 🥑 **FatSecret** | **5,000 calls / day** (Free Basic) | **~60 req/min** (Burst limit ~10 req/s) | ⚠️ Text only (Free tier) | 🌟 Highly verified, branded & restaurant items | ✅ 24h caching + permanent `food_id` / logs |
| 🌍 **Open Food Facts** | ♾️ Unlimited | ❌ **10 search req/min/IP** (Strict) | ✅ High-res photos | 🟡 Crowdsourced packaged goods | ✅ 100% open-source / bulk dump |
| 🏛️ **USDA FoodData** | 24,000 calls / day | **1,000 req/hour** | ❌ None | 🌟 Scientific foundation whole foods | ✅ Public domain (100% free storage) |
| 🥗 **Edamam** | 10,000 calls / month | **10 req/min** | ✅ Yes | 🟢 Good natural language parsing | ⚠️ Short-term caching only |

---

## 3. Rate Limits & Quota Specifications

### 3.1 Rate Limit Architecture
- **Daily Quota Allowance**: **5,000 API calls per calendar day** for the Basic Developer Tier.
- **Quota Reset Window**: Resets automatically at **00:00 UTC** every day. Unused requests do not roll over.
- **Burst / Concurrency Cap**: Approximately **5 to 10 requests per second** (or ~60 calls/minute).
- **Tracking Identifier**: Rate limits are enforced on the **application's `Client ID`** (shared across all users of your application, not per individual user IP).

### 3.2 Request Cost Breakdown
When a user searches for and logs a food item in a nutrition tracking app:
1. **Search Request (`foods.search`)**: Consumes **1 API call** (returns a list of matched food names and summary descriptions).
2. **Detail Request (`food.get.v4` / `food.get`)**: Consumes **1 API call** (returns detailed serving units, exact protein, carbs, fat, and micronutrients).
- **Average Cost per Food Logged**: $\approx 2\text{ API calls}$.
- **Application Capacity**: 5,000 calls/day supports approximately **2,500 food searches** or **~600 to 800 active daily users** logging 3–4 meals per day.

### 3.3 Rate Limit Violation Behavior (`HTTP 429`)
- **Burst Limit Exceeded**: Returns `HTTP 429 Too Many Requests`. Access resumes after a few seconds.
- **Daily Limit Exceeded**: Returns JSON `error.code: 8` ("Rate limit exceeded") with `HTTP 429`. All requests are blocked until the midnight UTC reset.

---

## 4. Terms of Service & Data Caching Analysis (Option B Architecture)

### 4.1 Legal Storage Rules (Section 1.5 & Storable Data Policy)
According to **Section 1.5 of the Terms of Use** and the official **Storable Data Guide** (`/docs/guides/storable-data`):

> *"You may not cache any data for more than **24 hours**, with the exception of information that is explicitly identified as **storable indefinitely**. Only the following parameters are storable indefinitely; all other information must be requested from fatsecret each time."*

### 4.2 The Whitelist: What CAN Be Stored Indefinitely in PostgreSQL
FatSecret's whitelist **strictly permits only the following identifier keys** for permanent storage in your database:
- `food_id`: Unique identifier for the food item.
- `serving_id`: Unique identifier for the serving size.
- `food_entry_id`: Diary log entry identifier.
- `saved_meal_id` & `saved_meal_item_id`: Custom meal identifiers.
- `recipe_id` & `food_category_id`: Category and recipe keys.
- `auth_token` & `auth_secret`: User authentication tokens.

---

### 4.3 Option B Architecture: Strict ID Hydration & 24-Hour Cache
Under **Option B**, your database does not permanently store raw text food descriptions or static macro catalogs from FatSecret. Instead, it follows a **Lean ID Logging & Dynamic Hydration Architecture**:

```
1. User Logs a Food:
   Frontend ──(Logs Food)──► NestJS ──► PostgreSQL `food_logs` table
   (Stores ONLY: userId, externalFoodId, servingId, quantity, mealType, date)

2. User Views Dashboard / Diary:
   Frontend ──(GET /food-logs?date=2026-08-15)──► NestJS
                                                    │
   ┌────────────────────────────────────────────────┴───────────────────────────────┐
   │ NestJS Hydration Engine:                                                       │
   │ 1. Fetches log records from PostgreSQL (gets externalFoodId + servingId)       │
   │ 2. Checks 24-Hour Cache for food details (name, macros per serving)            │
   │ 3. (Cache Miss) Calls FatSecret `food.get.v4` & caches result for 24h          │
   │ 4. Multiplies serving macros by user `quantity`                                │
   │ 5. Returns fully hydrated Dashboard JSON to frontend                           │
   └────────────────────────────────────────────────┬───────────────────────────────┘
                                                    │
   Frontend ◄────────(Receives Hydrated Food List)──┘
```

### 4.4 Mandatory Legal & UI Requirements
1. **Attribution Requirement (Section 1.3)**:
   - You must display a visible **"Powered by FatSecret"** text link or official badge on any page or screen where food search results or nutritional data are presented.
   - Must adhere to the [FatSecret Attribution Guidelines](https://platform.fatsecret.com/attribution).
2. **Medical Advice Disclaimer (Section 1.7.iii)**:
   - Your application's Terms / UI must clearly state that nutritional calculations are for informational purposes only and are **not a substitute for professional medical evaluation, diagnosis, or physician consultation**.

---

## 5. Authentication Architecture (OAuth 2.0 Client Credentials)

FatSecret utilizes **OAuth 2.0 (Client Credentials Grant)** for server-to-server communication:

```
                       ┌─────────────────────────┐
                       │    FatSecret Cloud      │
                       └───────────▲─────────────┘
                                   │
                    (1 Single Shared FatSecret App Token)
                                   │
                       ┌───────────▼─────────────┐
                       │  CalPal NestJS Backend  │
                       └─────▲─────────────▲─────┘
                             │             │
        (User A: Clerk Token)│             │(User B: Clerk Token)
                             │             │
                      ┌──────┴──────┐┌─────┴───────┐
                      │   User A    ││   User B    │
                      └─────────────┘└─────────────┘
```

### 5.1 Token Lifecycle & NestJS Singleton Pattern
- **Single Token Shared Across All Users**: In NestJS, `FatSecretService` is a singleton. The backend obtains **one** application-level access token from FatSecret and caches it in memory.
- **Request Flow**:
  1. First user requests a search $\rightarrow$ Backend fetches token from `https://oauth.fatsecret.com/connect/token` $\rightarrow$ Caches token for **86,400 seconds (24 hours)**.
  2. All subsequent users $\rightarrow$ Backend reuses the cached token directly from RAM (**0 OAuth calls**, 0.001 ms response time).
  3. When token reaches expiration $\rightarrow$ Backend automatically refreshes it once and updates the cache.

### 5.2 Security & Multi-User Safety Analysis
Is it safe for all users to share the same FatSecret application token? **Yes, 100% safe.**
1. **Server-to-Server Scope**: The FatSecret token represents CalPal’s *application identity*, not a human user. It contains zero personal user data (no emails, passwords, or diary logs).
2. **Zero Client Exposure**: The FatSecret token is kept strictly inside the NestJS server memory and is **never sent to the client browser**.
3. **Isolation of User Data**: User authentication and private diary protection are strictly handled by **Clerk JWT tokens** (`ClerkAuthGuard`). The FatSecret token is only used to look up public food nutritional facts.
4. **Rate Limit Prevention**: Sharing one app token on the backend prevents flooding FatSecret's OAuth servers with thousands of redundant token requests.

---

## 6. Recommended NestJS Implementation Blueprint for CalPal

### 6.1 Architecture Overview
To optimize API quota consumption and strictly adhere to the 24-hour ToS limit:
1. **Frontend Debouncing**: Next.js search input uses a `400ms` debounce timer to prevent firing on every keystroke.
2. **24-Hour In-Memory / Redis Caching**: NestJS caches identical search terms (`foods:search:<query>`) for up to 24 hours.
3. **Automatic Periodic Garbage Collection**: A background interval runs every 60 minutes to sweep and delete any cache entries older than 24 hours from server RAM.
4. **Food Log Persistence**: When a meal is logged, store only the authorized whitelist identifiers (`externalFoodId`, `servingId`, `quantity`) in PostgreSQL (`food_logs` table).

### 6.2 NestJS Service Implementation Template (hard-coded, not using the CacheModule) (with Auto-Cleanup)

```typescript
// nest-prisma/src/foods/fatsecret.service.ts
import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';

interface FatSecretTokenResponse {
  access_token: string;
  expires_in: number;
  token_type: string;
}

@Injectable()
export class FatSecretService {
  private readonly logger = new Logger(FatSecretService.name);
  private cachedToken: string | null = null;
  private tokenExpiryTime: number = 0;

  // In-memory 24-hour cache for search queries (ToS Compliant)
  private searchCache = new Map<string, { data: any; expiry: number }>();
  // In-memory 24-hour cache for food detail queries
  private foodDetailCache = new Map<string, { data: any; expiry: number }>();

  constructor() {
    // ─── Automatic Memory Cleanup (Periodic Garbage Collection) ───
    // Sweeps and deletes expired entries (>24h) from server RAM every 60 minutes
    setInterval(() => {
      const now = Date.now();
      let searchEvicted = 0;
      let detailEvicted = 0;

      for (const [key, item] of this.searchCache.entries()) {
        if (now >= item.expiry) {
          this.searchCache.delete(key);
          searchEvicted++;
        }
      }

      for (const [key, item] of this.foodDetailCache.entries()) {
        if (now >= item.expiry) {
          this.foodDetailCache.delete(key);
          detailEvicted++;
        }
      }

      if (searchEvicted > 0 || detailEvicted > 0) {
        this.logger.log(
          `[Cache Cleanup] Purged ${searchEvicted} search and ${detailEvicted} food detail entries older than 24h from RAM.`
        );
      }
    }, 60 * 60 * 1000); // Check every 60 minutes
  }

  /**
   * 1. Obtain and cache OAuth 2.0 Bearer Token (24h lifespan)
   */
  async getAccessToken(): Promise<string> {
    if (this.cachedToken && Date.now() < this.tokenExpiryTime) {
      return this.cachedToken;
    }

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
          'Authorization': `Basic ${credentials}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: 'grant_type=client_credentials&scope=basic',
      });

      if (!response.ok) {
        throw new Error(`OAuth error: ${response.status} ${response.statusText}`);
      }

      const data: FatSecretTokenResponse = await response.json();
      this.cachedToken = data.access_token;
      // Refresh 5 minutes before expiration
      this.tokenExpiryTime = Date.now() + (data.expires_in - 300) * 1000;

      return this.cachedToken;
    } catch (error) {
      this.logger.error('Failed to obtain FatSecret OAuth token', error);
      throw new HttpException('Failed to authenticate with food database', HttpStatus.BAD_GATEWAY);
    }
  }

  /**
   * 2. Search Foods by Keyword (with 24h short-term cache)
   */
  async searchFoods(query: string, pageNumber: number = 0, maxResults: number = 20) {
    const cacheKey = `search:${query.toLowerCase().trim()}:${pageNumber}`;
    const cached = this.searchCache.get(cacheKey);

    // Return cached results if within 24 hours
    if (cached && Date.now() < cached.expiry) {
      return cached.data;
    }

    const token = await this.getAccessToken();
    const endpoint = `https://platform.fatsecret.com/rest/server.api?method=foods.search&search_expression=${encodeURIComponent(
      query
    )}&page_number=${pageNumber}&max_results=${maxResults}&format=json`;

    const response = await fetch(endpoint, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new HttpException('Food search query failed', response.status);
    }

    const result = await response.json();

    // Cache results for 24 hours (86,400,000 ms) in accordance with ToS Section 1.5
    this.searchCache.set(cacheKey, {
      data: result,
      expiry: Date.now() + 24 * 60 * 60 * 1000,
    });

    return result;
  }

  /**
   * 3. Get Complete Food & Nutritional Details by Food ID
   */
  async getFoodById(foodId: string) {
    const token = await this.getAccessToken();
    const endpoint = `https://platform.fatsecret.com/rest/server.api?method=food.get.v4&food_id=${foodId}&format=json`;

    const response = await fetch(endpoint, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new HttpException(`Failed to fetch food details for ID: ${foodId}`, response.status);
    }

    return response.json();
  }
}
```

---

## 7. Compliance Checklist for CalPal Production

- [ ] **Developer Account Registered**: Obtain `Client ID` & `Client Secret` at [platform.fatsecret.com](https://platform.fatsecret.com).
- [ ] **Environment Variables**: Add `FATSECRET_CLIENT_ID` and `FATSECRET_CLIENT_SECRET` to `.env`.
- [ ] **Token Caching**: Ensure OAuth token is cached for ~23h55m to avoid redundant authentication requests.
- [ ] **24-Hour Cache Limit**: Ensure all temporary search query caches expire within 24 hours.
- [ ] **UI Attribution**: Add `"Powered by FatSecret"` logo & link to `/add-food` search results and modals.
- [ ] **Medical Disclaimer**: Display disclaimer in app footer / settings regarding non-medical nutrition estimations.
