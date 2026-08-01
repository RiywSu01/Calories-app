# Calories-app

## MVP features

- user can store and see daily calories for individuals (remind user calories left like today 2800/3200 cal protein, fat, and carbs intakes for daily).
- Have auto calculate ( BMR, TDEE).
- Collect 3 meal routines data for each days (Breakfast, lunch, dinner)
- Have calendar features.
- Additional: AI analyze foods by picture.

### Source for calculate the BMR, TDEE

- https://hdmall.co.th/health-tools/tdee-calculator.html
- https://www.petcharavejhospital.com/th/Article/BMR-calculator-loseweight

---

## Tech Stack

- FrontEnd: NextJS (React)
- BackEnd: NestJS (TypeScript)
- Database: PostgreSQL + PrismaORM
- External data for food info(API): FatSecret  [NOT USED FOR NOW, IMPLEMENT BY OWNS]
- Auth: Clerk
- Doc: Swagger
- Validation: class-validator + class transformer
- Containerization: Docker + Docker Compose + Nginx
- Testing: Jest + Supertest + autocannon

---

## Database Design

relationships

- 1 user can be  stored many on daily_logs ( user (1) —> (M) daily_log )
- many food can store in many daily_logs ( food (M) —> (N) daily_log )

|- Therefore “consumed_foods” table have to be created to be a junction table for M:N table. 
( daily_log (1) —> (M) consumed_foods (M) —> (1) foods )

Tables

- users
- users_credentials
- daily_logs
- foods  (Now used own database, NOT THE EXTERNAL API YET.)
- consumed_foods

![diagram-export-7-27-2026-7_08_32-PM.png](diagram-export-7-27-2026-7_08_32-PM.png)

### Tables

1. users *(Stores user information)*

| field | Data Type | Purpose | Example |
| --- | --- | --- | --- |
| user_ID | UUID | [PK] stored user id. | `usr_5f8a…` |
| email | String | Unique identifier for login and account recovery. | `user@mail.com` |
| username | String | Username for the users. | `JohnDoe123` |
| role | Enum | User’s role (e.g, user, admin). | `user` |
| target_calories | Int | target calories of the user. | `3000` |
| target_protein | Int | target protein of the user. | `300` |
| target_fat | Int | target fat of the user. | `300` |
| target_carbs | Int | target carbs of the user. | `300` |
| activity_level | Enum | Activity level of user (e.g., sedentary, light, moderate, active and very active). | `moderate` |
| BMR | Float | Stored BMR value for the user. | `1250.0` |
| TDEE | Float | Stored TDEE value for the user. | `1250.0` |
| created_at | DateTime | Tracking the created date of each data in users table. | `2026-07-25 08:00:00` |
| updated_at | DateTime | Tracking the updated date of each data in users table. | `2026-07-25 08:00:00` |
2. users_credentials *(Stores user crendential informations and the physical metrics required for BMR/BMI calculations)*

| field | Data Type | Purpose | Example |
| --- | --- | --- | --- |
| user_ID | UUID | [PK][FK] from users. | `usr_5f8a…` |
| auth_provider | Enum | Tracks if login is via Email, Google, Apple, etc. | `Google` |
| height_cm | Float | height of user | `75.6` |
| weight_kg | Float | weight of user | `173.0` |
| date_of_birth | Date | dob of user | `2004-05-12` |
| gender | Enum | Stored gender of the user (e.g., male, female). | `male` |
| created_at | DateTime | Tracking the created date of each data in users table. | `2026-07-25 08:00:00` |
| updated_at | DateTime | Tracking the updated date of each data in users table. | `2026-07-25 08:00:00` |

3. daily_logs *(The main container for a specific user on a specific calendar day)*

| field | Data Type | Purpose | Example |
| --- | --- | --- | --- |
| daily_log_ID | UUID | [PK] (avoids exposing sequential user counts). | `log_5f8a…` |
| user_ID | UUID | [FK] from users. | `usr_5f8a…` |
| log_date | Date | Real date that this daily_log stored.  | `2004-05-12` |
| total_calories | Int | Total calories for the days of the day that relate to the daily_log. | `3000` |
| total_protein | Float | Total protein intake for the day. | `300.0` |
| total_fat | Float | Total fat intake for the day. | `300.0` |
| total_carbs | Float | Total carbs intake for the day. | `300.0` |
| created_at | DateTime | Tracking the created date of each data in daily_logs table. | `2026-07-25 08:00:00` |
| updated_at | DateTime | Tracking the updated date of each daily_logs table. | `2026-07-25 08:00:00` |
4. foods  [NOW USED OWNS DATABASE]
- *OWNS DATABASE*

| field | Data Type | Purpose | Example |
| --- | --- | --- | --- |
| food_ID | UUID | [PK] (avoids exposing sequential user counts). | `fd_9d1e…` |
| food_name | String | Unique food name. | `Whey Protein Isolate` |
| calories_per_serving | Int | Stored calories per serve of food. | `120` |
| serving_size | String | Stored the serving unit (e.g., gram, ounce, etc.) | `gram` |
| protein | Float | Stored protein values of the food. | `25.5` |
| fat | Float | Stored fat values of the food. | `25.5` |
| carbs | Float | Stored carbs values of the food. | `25.5` |
| category | String | Category of the food. | `Supplement` |
| image_url | String | Stored URL link of the image. | `https://images.unsplash.com` |
| created_at | DateTime | Tracking the created date of each data in foods table. | `2026-07-24 18:00:0` |
| updated_at | DateTime | Tracking the updated date of each data in foods table. | `2026-07-24 18:00:0` |
- *External API [NOT USED FOR NOW, AND NOT DONE BECAUSE IT DEPEND ON THE HOST API VALUES THAT THEY DECLARED]*

*(Your local cache of items pulled from the Food Fact API)*

| field | Data Type | Purpose | Example |
| --- | --- | --- | --- |
| food_ID | UUID | [PK] (avoids exposing sequential user counts). | `fd_9d1e…` |
| api_reference_ID | UUID | Stored api_id from the External API. | `ff_api_7739` |
| food_name | String | Stored food name. | `Whey Protein Isolate` |
| calories_per_serving | Int | Stored calories per serve of food. | `120` |
| category | String | Category of the food. | `Supplement` |
| created_at | DateTime | Tracking the created date of each foods. | `2026-07-24 18:00:00` |
| updated_at | DateTime | Tracking the updated date of each data in foods table. | `2026-07-24 18:00:0` |
5. consumed_foods *(The M:N Junction table connecting the food to the specific daily log)*

| Field | Data Type | Purpose | Example |
| --- | --- | --- | --- |
| CF_ID | UUID | [PK]  (avoids exposing sequential user counts). | `cf_9d1e…` |
| daily_log_ID | UUID | [FK] of daily_log_ID from Table daily_logs. | `log_2b4c…` |
| food_ID | UUID | [FK] of food_ID from Table foods. | `fd_3a2b…` |
| amount | Float | Stored the amount of the food. | `1.5` |
| amount_type | Enum | Stored the measurement type of the amount values (e.g, gram, oz). | `gram` |
| meal_type | String | Stored the meal routine. | `Lunch` |
| created_at | DateTime | Tracking the created date of each foods. | `2026-07-24 18:00:00` |
| updated_at | DateTime | Tracking the updated date of each data in consumed_foods table. | `2026-07-24 18:00:00` |

### Key adjustment made on PostgreSQL script

#### **Key Adjustments Made for PostgreSQL**

• **Data Types**: `String` mapped to `VARCHAR`/`TEXT`, `Int` mapped to `INT`, `Float` mapped to `DOUBLE PRECISION`, and `DateTime` mapped to `TIMESTAMP WITH TIME ZONE`.  
• **Foreign Keys & Cascade Rules**: Foreign keys link `users_credentials.user_id` and `daily_logs.user_id` directly to `users.user_id`, enabling cascading deletes when a user account is removed.  
• **Constraints**: Added a `UNIQUE` constraint on `(user_id, log_date)` in `daily_logs` to ensure a user only has one active log container per calendar date

#### Added Safety Features

1. **Transaction Guard (`BEGIN;` ... `COMMIT;`)**: Wraps the entire DDL script. If any single command fails or encounters an issue, Postgres immediately rolls back all changes, avoiding partial/corrupted schema states.
2. **Idempotency (`IF NOT EXISTS`)**: Uses `CREATE TABLE IF NOT EXISTS` and conditional checks for `ENUM` types so running the script multiple times won't throw errors or destroy existing data.
3. **Data Integrity (`CHECK` Constraints)**: Added domain validation rules to prevent corrupt or nonsensical data at the DB level (e.g., negative calories, zero weight/height, negative macro values).
4. **Trigger Drop Guards (`DROP TRIGGER IF EXISTS`)**: Prevents duplicate trigger errors during migration runs.

---

## Back-End Design  (Maybe FIX)

### **Functional Requirements**

*define what a system must do (its core features, business rules, and user actions)*

- users
    1. **Registration & Login:** Users must be able to register and log in using an email/password combination
    2. **Password Recovery:** Users must be able to reset forgotten passwords via a secure, time-sensitive email link.
    3. R**ole-Based Access Control (RBAC):** The system must support at least two user roles (e.g., Standard User and Administrator), restricting access to specific pages and API endpoints based on the assigned role.
    4. **Account Deletion:** Users must be able to permanently delete their account and associated personal data to comply with privacy regulations (like GDPR/CCPA).
    5. **Update**: user can update their information (e.g., email, password)
    6. **Data Management (CRUD):** Users must be able to Create, Read, Update, and Delete core entities associated with their account.
    7. **Health Profile:** The system must allow users to input baseline metrics (age, gender, current weight, height, and activity level) during onboarding.
    8. **Goal Adjustments:** Users must be able to manually override the system's suggested targets and update their current weight over time to track progress.
- system
    1. **Data Validation:** All user inputs must be validated on both the client side (for immediate feedback) and the server side (for security) before processing.
    2. **Transactional Emails:** The system must send automated emails for critical account events (e.g., welcome email, password reset).
    3. **Data Log**: should log helpful message on the terminal to help developer see what going and debugging easier.
    4. **Optimization**: have one caching technique that can increase the web app performance.
    5. **Health Check**: should implement endpoints that can check health of systems.
    6. **API Docs**: Using Swagger for API documentations.
- security
    1. **Data Encryption:** All data in transit must be encrypted using TLS 1.2 or higher (HTTPS). Passwords must be hashed using a strong algorithm before storage.
    2. **Session Management:** The system must securely manage user sessions using HttpOnly, secure cookies, or short-lived JWTs (JSON Web Tokens), expiring automatically after 24 hours of inactivity.
    3. **Abuse Prevention:** The login and password reset APIs must implement rate-limiting (e.g., max 5 attempts per minute) to prevent brute-force attacks.
    4. **Reverse Proxy**: implement reverse proxy using nginx for secure website.
- Add food
    1. **Food Database Search:** Users can choose 2 method (1.search from food database: can search foods to adding to the daily meal routine, 2.Customized by yourself: user can customize food details by themself )to add their food to daily meal routine.
- Dashboard & Analytics
    1. **Daily Dashboard:** The homepage must display a visual progress bar showing calories consumed versus calories remaining for the day, alongside a macro breakdown.
    2. **Progress Charts:** The system must provide visual graphs (line or bar charts) showing historical weight trends and average daily caloric intake over weekly and monthly periods.
- Containerization
    1. Dockerize: should implement containerization of this project like Dockerfile, Docker-compose, Dockerignore for better future working.
- Testing
    
    Test: Should implement Unit Tests (test each service and controller in isolation with mocked dependencies. ), and  E2E Tests (send real HTTP requests through the full NestJS application with mocked database).
    
- Performance
    1. Benchmark: implement the benchmark so that can see performance of the web application.
    
- Project Documentation
    
    Create a project learning documentation that explain and summary the whole process of what you have done to this project in details like why you do this, why you choose this, what it solve like explain every detail, every though.
    

### **Non-Functional Requirements**

define ***how*** the system should perform (its underlying properties, quality attributes, and constraints like speed, security, and reliability)

- Performance & Responsiveness
    1. **Search Speed:** Because logging food is the most frequent action, query results from the food database must populate in under 300 milliseconds.
    2. **Offline Support:** The mobile/web application should cache recent food searches and allow users to log basic entries while offline, automatically syncing to the database once the connection is restored.
    3. **Mobile-First Design:** Since users typically log food on the go, the UI must be designed mobile-first, rendering perfectly on screens down to 320px wide with touch-friendly buttons.
- Reliability & Integration
    1. **Third-Party API Uptime:** If the app relies on external food databases (like FatSecret or Edamam API), the system must have graceful fallbacks or error messages if the third-party service experiences downtime.
    2. **Data Consistency:** The system must accurately handle time zones, ensuring that a user's "daily log" resets at midnight in their local time zone, regardless of server location.

---

## Front-End Design

### **Key features working:**

- 🔐 Sign up with BMR/BMI auto-calculation
- 📊 Animated calorie ring showing consumed vs. goal
- 🔍 Food search from 50+ built-in foods
- 🍽️ Breakfast/Lunch/Dinner accordion sections
- 📅 Week calendar date picker
- 🌙 Dark mode toggle

### Design

1. Login Page
2. Personal Page / Dashboard Page

This page is to shown calendar, individual overall calories, fat, protien, carb, taken on daily. Can see the daily food routine lilke breakfast, lunch, dinner that what individual eat for that food routine (design like a dropdown for each section, breakfast, lunch and dinner)

1. Add Food Method select Page (2 method)

1.search - choose this will go to the Search page, that can search for each food that my backend have prepared the data for user to query.

2.Customize - this page will go to the customize page that user can input the data like photo of food, food calories, carb, protien, etc. by themself to add to the daily food routine for that day.|

### Style/Theme

- minimal & Cute style of design like a recent start up app that design minimal and cute look relax and interest to use. (SHOULD SHOW EXAMPLE OF THE DESIGN FOR ME TO APPROVE FIRST.)

---
