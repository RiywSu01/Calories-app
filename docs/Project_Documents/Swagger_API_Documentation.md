# CalPal REST API — Swagger & OpenAPI 3.0 Documentation

## 1. Overview & Interactive Swagger UI

The **CalPal Backend** (`nest-prisma`) provides a complete **OpenAPI 3.0 / Swagger** interactive documentation interface.

* 🌐 **Interactive Swagger UI**: [http://localhost:3001/api](http://localhost:3001/api)
* 📄 **OpenAPI Specification JSON**: [http://localhost:3001/api-json](http://localhost:3001/api-json)
* 🔒 **Authentication Scheme**: Clerk JWT Bearer Token (`clerk-auth`)

---

## 2. Authentication & Authorization

All protected routes require an HTTP `Authorization` header with a valid Clerk session JWT:

```http
Authorization: Bearer <clerk_session_jwt>
```

In the **Swagger UI** (`/api`):
1. Click the **Authorize 🔓** button at the top right of the page.
2. In the `clerk-auth` input box, enter your Clerk JWT token.
3. Click **Authorize** and then **Close**. All subsequent requests sent through Swagger UI will include the `Authorization: Bearer <token>` header automatically.

---

## 3. Rate Limiting Policy Summary

All routes are guarded by `@nestjs/throttler` (`ThrottlerGuard`) to prevent abusive scraping and preserve the shared 5,000 daily FatSecret API quota:

| Route Scope | Short Tier (1s Burst) | Medium Tier (10s) | Long Tier (60s Sustained) | Exceeded Response |
| :--- | :---: | :---: | :---: | :--- |
| **`GET /foods/search`** | **3 req / 1s** | **10 req / 10s** | **25 req / 60s** | `HTTP 429 Too Many Requests` |
| **`GET /foods/external/:id`** | **5 req / 1s** | **15 req / 10s** | **40 req / 60s** | `HTTP 429 Too Many Requests` |
| **`POST /foods/ai-analyze`** | **1 req / 1s** | **3 req / 10s** | **10 req / 60s** | `HTTP 429 Too Many Requests` |
| **Global Baseline** | **3 req / 1s** | **15 req / 10s** | **60 req / 60s** | `HTTP 429 Too Many Requests` |
| **`GET /foods/cache-dump`** | ♾️ | ♾️ | ♾️ | `@SkipThrottle()` (No limit) |

---

## 4. Complete API Endpoint Reference

```
CalPal REST API
├── 🏷️ App
│   ├── GET  /                          (Root welcome message)
│   └── GET  /health                    (Live PostgreSQL database health & latency check)
├── 🥑 Foods
│   ├── POST /foods/ai-analyze          (AI Multimodal Meal & Photo Analyzer)
│   ├── GET  /foods/search              (Search verified foods via FatSecret API)
│   ├── GET  /foods/external/:id        (Get food details & servings by FatSecret ID)
│   ├── GET  /foods/cache-dump          (Inspect in-memory 24h cache state)
│   ├── POST /foods                     (Create custom food recipe) [🔒 Protected]
│   ├── GET  /foods                     (Get all custom foods)
│   ├── GET  /foods/:id                 (Get custom food by UUID)
│   ├── PATCH /foods/edit/:id           (Update custom food recipe) [🔒 Protected]
│   └── DELETE /foods/remove/:id        (Delete custom food recipe) [🔒 Protected]
├── 📖 Food Logs
│   ├── POST /food-logs                 (Log a food entry to diary) [🔒 Protected]
│   ├── GET  /food-logs                 (Query food logs with 24h hydration) [🔒 Protected]
│   ├── GET  /food-logs/:id             (Get single food log entry) [🔒 Protected]
│   ├── PATCH /food-logs/:id            (Update portion quantity or meal type) [🔒 Protected]
│   └── DELETE /food-logs/:id           (Delete food log entry) [🔒 Protected]
├── 👤 Users
│   ├── POST /user                      (Create/sync user account) [🔒 Protected]
│   ├── GET  /user                      (Get all registered users) [🔒 Protected]
│   ├── GET  /user/:id                  (Get user details by ID) [🔒 Protected]
│   ├── PATCH /user/:id                 (Update user account) [🔒 Protected]
│   └── DELETE /user/:id                (Delete user account) [🔒 Protected]
├── 📊 User Profiles
│   ├── POST /profile                   (Create biometric profile & targets) [🔒 Protected]
│   ├── GET  /profile                   (Get all user profiles) [🔒 Protected]
│   ├── GET  /profile/:id               (Get profile & targets by User ID) [🔒 Protected]
│   ├── PATCH /profile/:id              (Update profile, metrics & targets) [🔒 Protected]
│   └── DELETE /profile/:id             (Delete user profile) [🔒 Protected]
└── 🔔 Webhooks
    ├── GET  /user/webhook              (Clerk Webhook health-check)
    └── POST /user/webhook              (Clerk Svix-signed user sync receiver)
```

---

### 4.1 App & System Health (`/`)

#### `GET /`
* **Description**: Simple root connection test endpoint.
* **Response** (`200 OK`): `"Hello, World!"`

---

#### `GET /health`
* **Description**: Live PostgreSQL database connectivity and performance health check.
* **Rate Limit**: `@SkipThrottle()` (Unlimited to support high-frequency monitoring tools).
* **Detailed Execution Logic**:
  1. **Rate-Limit Exemption (`@SkipThrottle()`)**: Prevents automated monitoring services (e.g. Render, AWS Target Groups, Kubernetes Liveness Probes, UptimeRobot) from hitting `HTTP 429` rate-limit errors when polling frequently.
  2. **Latency Timing**: Starts a high-resolution millisecond timer (`Date.now()`) immediately prior to executing the database query.
  3. **Active PostgreSQL Probe (`$queryRaw`)**: Executes a lightweight query `SELECT 1 AS ping, NOW() AS db_time` directly against PostgreSQL (`localhost:5432`). This physically tests:
     - TCP network socket between Node.js and PostgreSQL.
     - Prisma connection pool health and idle connection availability.
     - PostgreSQL database engine responsiveness and internal system clock (`db_time`).
  4. **Process Uptime**: Calculates total uninterrupted server uptime in seconds (`process.uptime()`).
  5. **Status Returns**:
     - Returns **`HTTP 200 OK`** when database is operational with measured round-trip ping time (e.g. `8ms`).
     - Throws **`HTTP 503 Service Unavailable`** if the database is unreachable or connection times out, signaling cloud load balancers to withhold traffic until recovery.

* **Response** (`200 OK` - Database Healthy):
  ```json
  {
    "status": "ok",
    "database": {
      "status": "up",
      "connected": true,
      "latencyMs": "8ms",
      "dbTime": "2026-08-31T14:35:06.202Z"
    },
    "service": "calpal-backend",
    "timestamp": "2026-08-31T07:35:06.206Z",
    "uptimeSeconds": 142
  }
  ```

* **Response** (`503 Service Unavailable` - Database Disconnected):
  ```json
  {
    "status": "error",
    "database": {
      "status": "down",
      "connected": false,
      "latencyMs": "120ms",
      "error": "Database query failed or connection timed out"
    },
    "service": "calpal-backend",
    "timestamp": "2026-08-31T07:35:06.206Z"
  }
  ```

---

### 4.2 Foods (`/foods`)

#### `POST /foods/ai-analyze`
* **Description**: Multimodal AI food scanner. Analyzes photo (base64) or prompt via Google Gemini 3.6 Flash and queries FatSecret database for matching verified foods.
* **Rate Limit**: Max 1 req/s, max 10 req/min.
* **Request Body** (`AnalyzeFoodDto`):
  ```json
  {
    "prompt": "A plate of grilled chicken breast with white rice",
    "imageBase64": "data:image/jpeg;base64,/9j/4AAQSkZJRg...",
    "mimeType": "image/jpeg"
  }
  ```
* **Response** (`200 OK` - `AIAnalysisResult`):
  ```json
  {
    "rawPrompt": "Photo Analysis",
    "foodName": "Grilled Chicken Breast",
    "thinking": "Identified lean grilled poultry fillet with visible grill marks.",
    "confidenceScore": 0.96,
    "foods": [
      {
        "food_id": "1641",
        "food_name": "Chicken Breast",
        "food_description": "Per 100g - Calories: 165kcal | Fat: 3.6g | Carbs: 0g | Protein: 31g"
      }
    ],
    "totalResults": 20
  }
  ```

---

#### `GET /foods/search`
* **Description**: Queries verified food database (FatSecret) with automatic 24-hour cache.
* **Rate Limit**: Burst max 3/s, sustained max 25/min.
* **Query Parameters**:
  * `query` (string, required): Food keyword (e.g. `chicken`, `apple`, `oatmeal`).
  * `page` (number, optional): Page index (default `0`).
  * `maxResults` (number, optional): Results per page (default `20`).
* **Response** (`200 OK`):
  ```json
  {
    "foods": [
      {
        "food_id": "1641",
        "food_name": "Chicken Breast",
        "food_type": "Generic",
        "food_description": "Per 101g - Calories: 197kcal | Fat: 7.79g | Carbs: 0.00g | Protein: 29.80g",
        "food_url": "https://foods.fatsecret.com/calories-nutrition/generic/chicken-breast"
      }
    ],
    "max_results": 20,
    "page_number": 0,
    "total_results": 2000
  }
  ```

---

#### `GET /foods/external/:id`
* **Description**: Returns detailed serving size units, portion options, and exact macro breakdown for a FatSecret food item.
* **Path Parameter**: `id` (string, required): FatSecret `food_id` (e.g. `1641`).
* **Response** (`200 OK`):
  ```json
  {
    "food_id": "1641",
    "food_name": "Chicken Breast",
    "servings": {
      "serving": [
        {
          "serving_id": "5023",
          "serving_description": "100 g",
          "metric_serving_amount": "100.000",
          "metric_serving_unit": "g",
          "calories": "165",
          "protein": "31.02",
          "fat": "3.57",
          "carbohydrate": "0.00"
        }
      ]
    }
  }
  ```

---

#### `POST /foods` 🔒
* **Description**: Create a custom homemade food recipe.
* **Security**: `Bearer <clerk_jwt>`
* **Request Body** (`CreateFoodDto`):
  ```json
  {
    "foodName": "Mom's Homemade Protein Shake",
    "caloriesPerServing": 320,
    "servingSize": 1,
    "servingUnit": "cup",
    "protein": 35.0,
    "fat": 6.0,
    "carbs": 28.0,
    "category": "Beverage",
    "imageUrl": "https://example.com/shake.jpg"
  }
  ```

---

### 4.3 Food Logs (`/food-logs`)

#### `POST /food-logs` 🔒
* **Description**: Logs a meal to the user's diary. Supports both FatSecret cloud items and custom recipe items.
* **Security**: `Bearer <clerk_jwt>`
* **Request Body** (`CreateFoodLogDto`):
  ```json
  {
    "userId": "user_3HiYHDqKiD1ZBevdfWANDSJ5Eph",
    "fatsecretFoodId": "1641",
    "fatsecretServingId": "5023",
    "quantity": 1.5,
    "mealType": "LUNCH"
  }
  ```
* **Response** (`201 Created`):
  ```json
  {
    "message": "New FoodLog has been created successfully.",
    "data": {
      "foodLogId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
      "userId": "user_3HiYHDqKiD1ZBevdfWANDSJ5Eph",
      "fatsecretFoodId": "1641",
      "fatsecretServingId": "5023",
      "quantity": 1.5,
      "mealType": "LUNCH",
      "createdAt": "2026-08-31T06:50:00.000Z"
    }
  }
  ```

---

#### `GET /food-logs` 🔒
* **Description**: Retrieves diary logs with dynamic 24-hour nutrition hydration for FatSecret items.
* **Security**: `Bearer <clerk_jwt>`
* **Query Parameters**:
  * `date` (string, optional): Filter by date `YYYY-MM-DD` (e.g. `2026-08-31`).
  * `userId` (string, optional): Filter by Clerk User ID.
  * `timezoneOffset` (string, optional): Local timezone offset in minutes (e.g. `-420` for UTC+7).
* **Response** (`200 OK`):
  ```json
  {
    "message": "FoodLogs retrieved successfully.",
    "data": [
      {
        "foodLogId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
        "mealType": "LUNCH",
        "quantity": 1.5,
        "foodName": "Chicken Breast",
        "servingSize": "100 g",
        "servingUnit": "g",
        "totalCalories": 248,
        "totalProtein": 46.5,
        "totalFat": 5.4,
        "totalCarbs": 0.0,
        "createdAt": "2026-08-31T06:50:00.000Z"
      }
    ]
  }
  ```

---

### 4.4 Users & Profiles (`/user`, `/profile`)

#### `GET /user/:id` 🔒
* **Description**: Returns user account details.
* **Security**: `Bearer <clerk_jwt>`
* **Path Parameter**: `id` (Clerk User ID).

#### `GET /profile/:id` 🔒
* **Description**: Returns biometric profile, calculated BMR, TDEE, BMI, and daily calorie/macronutrient targets.
* **Security**: `Bearer <clerk_jwt>`
* **Path Parameter**: `id` (Clerk User ID).
* **Response** (`200 OK`):
  ```json
  {
    "userId": "user_3HiYHDqKiD1ZBevdfWANDSJ5Eph",
    "heightCm": 175.5,
    "weightKg": 70.2,
    "gender": "male",
    "goalMode": "lose",
    "activityLevel": "moderate",
    "bmr": 1680.5,
    "tdee": 2350.0,
    "bmi": 22.8,
    "bmiCategory": "Normal weight",
    "targetCalories": 1850,
    "targetProtein": 150,
    "targetFat": 55,
    "targetCarbs": 190
  }
  ```

---

### 4.5 Webhooks (`/user/webhook`)

#### `POST /user/webhook`
* **Description**: Receives user lifecycle events from Clerk. Verifies Svix cryptographic signature and syncs users in PostgreSQL.
* **Headers Required**:
  * `svix-id`: Unique Svix message ID
  * `svix-timestamp`: Timestamp string
  * `svix-signature`: Svix HMAC signature
* **Supported Events**:
  * `user.created` $\rightarrow$ Inserts new user in `users` table.
  * `user.updated` $\rightarrow$ Updates user email and username.
  * `user.deleted` $\rightarrow$ Cascades user account deletion.

