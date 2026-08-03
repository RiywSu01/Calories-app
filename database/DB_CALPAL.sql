-- ==========================================================
-- CALORIE TRACKER DATABASE
-- PostgreSQL 15+
-- ==========================================================
-- Version: 2.0
-- ==========================================================

BEGIN;

SET client_min_messages = warning;

CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==========================================================
-- DROP TABLES
-- ==========================================================

DROP TABLE IF EXISTS food_logs CASCADE;
DROP TABLE IF EXISTS foods CASCADE;
DROP TABLE IF EXISTS user_profiles CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- ==========================================================
-- ENUMS
-- ==========================================================

DO $$
BEGIN

    IF NOT EXISTS (
        SELECT 1
        FROM pg_type
        WHERE typname = 'user_role'
    ) THEN
        CREATE TYPE user_role AS ENUM (
            'user',
            'admin'
        );
    END IF;

    IF NOT EXISTS (
        SELECT 1
        FROM pg_type
        WHERE typname = 'auth_provider_type'
    ) THEN
        CREATE TYPE auth_provider_type AS ENUM (
            'Email',
            'Google',
            'Apple'
        );
    END IF;

    IF NOT EXISTS (
        SELECT 1
        FROM pg_type
        WHERE typname = 'gender_type'
    ) THEN
        CREATE TYPE gender_type AS ENUM (
            'male',
            'female'
        );
    END IF;

    IF NOT EXISTS (
        SELECT 1
        FROM pg_type
        WHERE typname = 'activity_level_type'
    ) THEN
        CREATE TYPE activity_level_type AS ENUM (
            'sedentary',
            'light',
            'moderate',
            'active',
            'very active'
        );
    END IF;

    IF NOT EXISTS (
        SELECT 1
        FROM pg_type
        WHERE typname = 'meal_type'
    ) THEN
        CREATE TYPE meal_type AS ENUM (
            'BREAKFAST',
            'LUNCH',
            'DINNER'
        );
    END IF;

END $$;

-- ==========================================================
-- USERS
-- ==========================================================

CREATE TABLE users (

    user_id UUID PRIMARY KEY
        DEFAULT gen_random_uuid(),

    email VARCHAR(255) NOT NULL UNIQUE,

    username VARCHAR(100) NOT NULL,

    role user_role NOT NULL
        DEFAULT 'user',

    created_at TIMESTAMPTZ NOT NULL
        DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMPTZ NOT NULL
        DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================================
-- USER PROFILES
-- ==========================================================

CREATE TABLE user_profiles (

    user_id UUID PRIMARY KEY,

    auth_provider auth_provider_type NOT NULL,

    height_cm DOUBLE PRECISION
        CHECK (height_cm > 0),

    weight_kg DOUBLE PRECISION
        CHECK (weight_kg > 0),

    date_of_birth DATE,

    gender gender_type,

    target_calories INTEGER
        CHECK (target_calories >= 0),

    target_protein INTEGER
        CHECK (target_protein >= 0),

    target_fat INTEGER
        CHECK (target_fat >= 0),

    target_carbs INTEGER
        CHECK (target_carbs >= 0),

    activity_level activity_level_type,

    bmr DOUBLE PRECISION
        CHECK (bmr >= 0),

    tdee DOUBLE PRECISION
        CHECK (tdee >= 0),

    created_at TIMESTAMPTZ NOT NULL
        DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMPTZ NOT NULL
        DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_profile_user
        FOREIGN KEY (user_id)
        REFERENCES users(user_id)
        ON DELETE CASCADE
);

-- ==========================================================
-- FOODS
-- ==========================================================

CREATE TABLE foods (

    food_id UUID PRIMARY KEY
        DEFAULT gen_random_uuid(),

    food_name VARCHAR(255) NOT NULL UNIQUE,

    calories_per_serving INTEGER NOT NULL
        CHECK (calories_per_serving >= 0),

    serving_size DOUBLE PRECISION NOT NULL
        CHECK (serving_size > 0),

    serving_unit VARCHAR(50) NOT NULL,

    protein DOUBLE PRECISION NOT NULL
        CHECK (protein >= 0),

    fat DOUBLE PRECISION NOT NULL
        CHECK (fat >= 0),

    carbs DOUBLE PRECISION NOT NULL
        CHECK (carbs >= 0),

    category VARCHAR(100),

    image_url TEXT,

    created_at TIMESTAMPTZ NOT NULL
        DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMPTZ NOT NULL
        DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================================
-- FOOD LOGS
-- ==========================================================

CREATE TABLE food_logs (

    food_log_id UUID PRIMARY KEY
        DEFAULT gen_random_uuid(),

    user_id UUID NOT NULL,

    food_id UUID NOT NULL,

    quantity DOUBLE PRECISION NOT NULL
        CHECK (quantity > 0),

    total_calories INTEGER
        CHECK (total_calories >= 0),

    total_protein DOUBLE PRECISION
        CHECK (total_protein >= 0),

    total_fat DOUBLE PRECISION
        CHECK (total_fat >= 0),

    total_carbs DOUBLE PRECISION
        CHECK (total_carbs >= 0),

    meal_type meal_type NOT NULL,

    created_at TIMESTAMPTZ NOT NULL
        DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMPTZ NOT NULL
        DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_food_logs_user
        FOREIGN KEY (user_id)
        REFERENCES users(user_id)
        ON DELETE CASCADE,

    CONSTRAINT fk_food_logs_food
        FOREIGN KEY (food_id)
        REFERENCES foods(food_id)
        ON DELETE RESTRICT
);

-- ==========================================================
-- INDEXES: for fast query, instead of it searching one by one, it can jump to the rows.
-- ==========================================================

CREATE INDEX idx_users_email
ON users(email);

CREATE INDEX idx_users_username
ON users(username);

CREATE INDEX idx_food_name
ON foods(food_name);

CREATE INDEX idx_food_category
ON foods(category);

CREATE INDEX idx_food_logs_user
ON food_logs(user_id);

CREATE INDEX idx_food_logs_food
ON food_logs(food_id);

CREATE INDEX idx_food_logs_meal_type
ON food_logs(meal_type);

CREATE INDEX idx_food_logs_created_at
ON food_logs(created_at);

CREATE INDEX idx_food_logs_user_created
ON food_logs(user_id, created_at DESC);


-- ==========================================================
-- TRIGGER FUNCTION: FOR THE UPDATED_AT to be updated if anythings got updated to that values,tables, to not manually write by myself.
-- ==========================================================
-- UPDATED_AT TRIGGER FUNCTION
-- ==========================================================

CREATE OR REPLACE FUNCTION update_timestamp_column()
RETURNS TRIGGER
AS $$
BEGIN

    NEW.updated_at = NOW();

    RETURN NEW;

END;
$$ LANGUAGE plpgsql;

-- ==========================================================
-- USERS TRIGGER
-- ==========================================================

DROP TRIGGER IF EXISTS trg_users_updated_at
ON users;

CREATE TRIGGER trg_users_updated_at
BEFORE UPDATE
ON users
FOR EACH ROW
EXECUTE FUNCTION update_timestamp_column();

-- ==========================================================
-- USER PROFILE TRIGGER
-- ==========================================================

DROP TRIGGER IF EXISTS trg_user_profiles_updated_at
ON user_profiles;

CREATE TRIGGER trg_user_profiles_updated_at
BEFORE UPDATE
ON user_profiles
FOR EACH ROW
EXECUTE FUNCTION update_timestamp_column();

-- ==========================================================
-- FOODS TRIGGER
-- ==========================================================

DROP TRIGGER IF EXISTS trg_foods_updated_at
ON foods;

CREATE TRIGGER trg_foods_updated_at
BEFORE UPDATE
ON foods
FOR EACH ROW
EXECUTE FUNCTION update_timestamp_column();

-- ==========================================================
-- FOOD LOGS TRIGGER
-- ==========================================================

DROP TRIGGER IF EXISTS trg_food_logs_updated_at
ON food_logs;

CREATE TRIGGER trg_food_logs_updated_at
BEFORE UPDATE
ON food_logs
FOR EACH ROW
EXECUTE FUNCTION update_timestamp_column();

-- ==========================================================
-- MOCK DATA
-- USERS
-- ==========================================================

INSERT INTO users (

    user_id,
    email,
    username,
    role

)
VALUES

(
    '11111111-1111-1111-1111-111111111111',
    'alex@example.com',
    'alex',
    'user'
),

(
    '22222222-2222-2222-2222-222222222222',
    'jane@example.com',
    'jane',
    'admin'
),

(
    '33333333-3333-3333-3333-333333333333',
    'mike@example.com',
    'mike',
    'user'
);

-- ==========================================================
-- MOCK DATA
-- USER PROFILES
-- ==========================================================

INSERT INTO user_profiles (

    user_id,
    auth_provider,
    height_cm,
    weight_kg,
    date_of_birth,
    gender,
    target_calories,
    target_protein,
    target_fat,
    target_carbs,
    activity_level,
    bmr,
    tdee

)
VALUES

(
    '11111111-1111-1111-1111-111111111111',
    'Google',
    175,
    72,
    '1995-04-12',
    'male',
    2200,
    160,
    70,
    230,
    'moderate',
    1700,
    2400
),

(
    '22222222-2222-2222-2222-222222222222',
    'Email',
    162,
    59,
    'female',
    '1990-08-25',
    1800,
    130,
    55,
    195,
    'active',
    1350,
    2050
);

-- ==========================================================
-- MOCK DATA
-- FOODS
-- ==========================================================

INSERT INTO foods (

    food_id,
    food_name,
    calories_per_serving,
    serving_size,
    serving_unit,
    protein,
    fat,
    carbs,
    category,
    image_url

)
VALUES

(
    'f1111111-1111-1111-1111-111111111111',
    'Chicken Breast',
    165,
    100,
    'gram',
    31,
    3.6,
    0,
    'Meat',
    'https://example.com/chicken.jpg'
),

(
    'f2222222-2222-2222-2222-222222222222',
    'Brown Rice',
    215,
    1,
    'cup',
    5,
    1.8,
    45,
    'Grains',
    'https://example.com/rice.jpg'
),

(
    'f3333333-3333-3333-3333-333333333333',
    'Avocado',
    160,
    100,
    'gram',
    2,
    15,
    9,
    'Fruit',
    'https://example.com/avocado.jpg'
),

(
    'f4444444-4444-4444-4444-444444444444',
    'Salmon Fillet',
    208,
    100,
    'gram',
    20.0,
    13.0,
    0.0,
    'Seafood',
    'https://example.com/salmon.jpg'
),

(
    'f5555555-5555-5555-5555-555555555555',
    'Boiled Egg',
    78,
    1,
    'piece',
    6.3,
    5.3,
    0.6,
    'Protein',
    'https://example.com/egg.jpg'
),

(
    'f6666666-6666-6666-6666-666666666666',
    'Banana',
    105,
    1,
    'piece',
    1.3,
    0.3,
    27.0,
    'Fruit',
    'https://example.com/banana.jpg'
),

(
    'f7777777-7777-7777-7777-777777777777',
    'Oatmeal',
    150,
    40,
    'gram',
    5.0,
    3.0,
    27.0,
    'Grains',
    'https://example.com/oatmeal.jpg'
),

(
    'f8888888-8888-8888-8888-888888888888',
    'Greek Yogurt',
    100,
    170,
    'gram',
    17.0,
    0.7,
    6.0,
    'Dairy',
    'https://example.com/yogurt.jpg'
);

INSERT INTO foods (
    food_name,
    calories_per_serving,
    serving_size,
    serving_unit,
    protein,
    fat,
    carbs,
    category,
    image_url
)
VALUES

(
    'Whole Wheat Bread',
    80,
    2,
    'slice',
    4.0,
    1.0,
    14.0,
    'Bakery',
    'https://example.com/bread.jpg'
),
(
    'Peanut Butter',
    188,
    32,
    'gram',
    8.0,
    16.0,
    7.0,
    'Spread',
    'https://example.com/peanut-butter.jpg'
);

-- ==========================================================
-- MOCK DATA
-- FOOD LOGS
-- ==========================================================

INSERT INTO food_logs (

    food_log_id,
    user_id,
    food_id,
    quantity,
    total_calories,
    total_protein,
    total_fat,
    total_carbs,
    meal_type

)
VALUES

(
    'a1111111-1111-1111-1111-111111111111',
    '11111111-1111-1111-1111-111111111111',
    'f1111111-1111-1111-1111-111111111111',
    2.0,
    330,
    62,
    7.2,
    0,
    'LUNCH'
),

(
    'a2222222-2222-2222-2222-222222222222',
    '11111111-1111-1111-1111-111111111111',
    'f2222222-2222-2222-2222-222222222222',
    1.5,
    322,
    7.5,
    2.7,
    67.5,
    'LUNCH'
),

(
    'a3333333-3333-3333-3333-333333333333',
    '22222222-2222-2222-2222-222222222222',
    'f3333333-3333-3333-3333-333333333333',
    1.0,
    160,
    2,
    15,
    9,
    'BREAKFAST'
);

COMMIT;