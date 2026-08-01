-- ==========================================
-- 0. SAFETY CONTROLS & ENVIRONMENT CHECKS
-- ==========================================

-- Prevent accidental execution on production/wrong databases by wrapping in a transaction.
-- If any statement fails, the entire script rolls back automatically.
BEGIN;

-- Drop existing tables to start fresh
DROP TABLE IF EXISTS consumed_foods CASCADE;
DROP TABLE IF EXISTS foods CASCADE;
DROP TABLE IF EXISTS daily_logs CASCADE;
DROP TABLE IF EXISTS user_profiles CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Explicitly ensure standard error handling
SET client_min_messages = warning;

-- Safe extension creation (will not throw error if already exists)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==========================================
-- 1. ENUM TYPES (SAFE CREATION)
-- ==========================================

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
        CREATE TYPE user_role AS ENUM ('user', 'admin');
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'activity_level_type') THEN
        CREATE TYPE activity_level_type AS ENUM ('sedentary', 'light', 'moderate', 'active', 'very active');
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'auth_provider_type') THEN
        CREATE TYPE auth_provider_type AS ENUM ('Email', 'Google', 'Apple');
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'gender_type') THEN
        CREATE TYPE gender_type AS ENUM ('male', 'female');
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'amount_unit_type') THEN
        CREATE TYPE amount_unit_type AS ENUM ('gram', 'oz');
    END IF;
END $$;

-- ==========================================
-- 2. TABLES (SAFE CREATION)
-- ==========================================

-- 1. users
CREATE TABLE IF NOT EXISTS users (
    user_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) NOT NULL UNIQUE,
    username VARCHAR(100) NOT NULL,
    role user_role DEFAULT 'user',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. user_profiles
CREATE TABLE IF NOT EXISTS user_profiles (
    user_id UUID PRIMARY KEY,
    auth_provider auth_provider_type NOT NULL,
    height_cm DOUBLE PRECISION CHECK (height_cm > 0),
    weight_kg DOUBLE PRECISION CHECK (weight_kg > 0),
    date_of_birth DATE,
    gender gender_type,
    target_calories INT CHECK (target_calories >= 0),
    target_protein INT CHECK (target_protein >= 0),
    target_fat INT CHECK (target_fat >= 0),
    target_carbs INT CHECK (target_carbs >= 0),
    activity_level activity_level_type,
    bmr DOUBLE PRECISION CHECK (bmr >= 0),
    tdee DOUBLE PRECISION CHECK (tdee >= 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_user_profiles_user FOREIGN KEY (user_id) 
        REFERENCES users(user_id) ON DELETE CASCADE
);

-- 3. daily_logs
CREATE TABLE IF NOT EXISTS daily_logs (
    daily_log_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    log_date DATE NOT NULL,
    total_calories INT CHECK (total_calories >= 0),
    total_protein DOUBLE PRECISION CHECK (total_protein >= 0),
    total_fat DOUBLE PRECISION CHECK (total_fat >= 0),
    total_carbs DOUBLE PRECISION CHECK (total_carbs >= 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_daily_logs_user FOREIGN KEY (user_id) 
        REFERENCES users(user_id) ON DELETE CASCADE,
    CONSTRAINT uq_user_log_date UNIQUE (user_id, log_date)
);

-- 4. foods
CREATE TABLE IF NOT EXISTS foods (
    food_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    food_name VARCHAR(255) NOT NULL UNIQUE,
    calories_per_serving INT NOT NULL CHECK (calories_per_serving >= 0),
    serving_size VARCHAR(100) NOT NULL,
    protein DOUBLE PRECISION CHECK (protein >= 0),
    fat DOUBLE PRECISION CHECK (fat >= 0),
    carbs DOUBLE PRECISION CHECK (carbs >= 0),
    category VARCHAR(100),
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. consumed_foods
CREATE TABLE IF NOT EXISTS consumed_foods (
    cf_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    daily_log_id UUID NOT NULL,
    food_id UUID NOT NULL,
    amount DOUBLE PRECISION NOT NULL CHECK (amount > 0),
    amount_type amount_unit_type NOT NULL,
    meal_type VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_consumed_foods_daily_log FOREIGN KEY (daily_log_id) 
        REFERENCES daily_logs(daily_log_id) ON DELETE CASCADE,
    CONSTRAINT fk_consumed_foods_food FOREIGN KEY (food_id) 
        REFERENCES foods(food_id) ON DELETE RESTRICT
);

-- ==========================================
-- 3. AUTOMATIC UPDATED_AT TRIGGER
-- ==========================================

CREATE OR REPLACE FUNCTION update_timestamp_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop trigger safely before creating to prevent duplicate execution errors
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE PROCEDURE update_timestamp_column();

DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON user_profiles;
CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles FOR EACH ROW EXECUTE PROCEDURE update_timestamp_column();

DROP TRIGGER IF EXISTS update_daily_logs_updated_at ON daily_logs;
CREATE TRIGGER update_daily_logs_updated_at BEFORE UPDATE ON daily_logs FOR EACH ROW EXECUTE PROCEDURE update_timestamp_column();

DROP TRIGGER IF EXISTS update_foods_updated_at ON foods;
CREATE TRIGGER update_foods_updated_at BEFORE UPDATE ON foods FOR EACH ROW EXECUTE PROCEDURE update_timestamp_column();

DROP TRIGGER IF EXISTS update_consumed_foods_updated_at ON consumed_foods;
CREATE TRIGGER update_consumed_foods_updated_at BEFORE UPDATE ON consumed_foods FOR EACH ROW EXECUTE PROCEDURE update_timestamp_column();


-- ==========================================
-- 1. INSERT MOCK DATA: users
-- ==========================================
INSERT INTO users (user_id, email, username, role)
VALUES 
    ('11111111-1111-1111-1111-111111111111', 'alex.doe@example.com', 'alex_doe', 'user'),
    ('22222222-2222-2222-2222-222222222222', 'jane.smith@example.com', 'jane_smith', 'admin'),
    ('33333333-3333-3333-3333-333333333333', 'mike.johnson@example.com', 'mike_j', 'user')
ON CONFLICT (email) DO NOTHING;

-- ==========================================
-- 2. INSERT MOCK DATA: user_profiles
-- ==========================================
INSERT INTO user_profiles (
    user_id, auth_provider, height_cm, weight_kg, date_of_birth, 
    gender, target_calories, target_protein, target_fat, target_carbs, 
    activity_level, bmr, tdee
)
VALUES 
    ('11111111-1111-1111-1111-111111111111', 'Google', 175.5, 72.0, '1995-04-12', 'male', 2200, 160, 70, 230, 'moderate', 1680.5, 2310.7),
    ('22222222-2222-2222-2222-222222222222', 'Email', 162.0, 58.5, '1990-08-25', 'female', 1800, 130, 55, 195, 'active', 1350.2, 2025.3),
    ('33333333-3333-3333-3333-333333333333', 'Apple', 180.0, 85.0, '1998-11-03', 'male', 2600, 180, 80, 290, 'very active', 1850.0, 2867.5)
ON CONFLICT (user_id) DO NOTHING;

-- ==========================================
-- 3. INSERT MOCK DATA: daily_logs
-- ==========================================
INSERT INTO daily_logs (daily_log_id, user_id, log_date, total_calories, total_protein, total_fat, total_carbs)
VALUES 
    ('a1111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', '2026-08-01', 2150, 155.0, 68.0, 225.0),
    ('a2222222-2222-2222-2222-222222222222', '22222222-2222-2222-2222-222222222222', '2026-08-01', 1780, 128.5, 52.0, 190.0),
    ('a3333333-3333-3333-3333-333333333333', '33333333-3333-3333-3333-333333333333', '2026-08-01', 2550, 175.0, 78.5, 285.0)
ON CONFLICT (user_id, log_date) DO NOTHING;

-- ==========================================
-- 4. INSERT MOCK DATA: foods
-- ==========================================
INSERT INTO foods (food_id, food_name, calories_per_serving, serving_size, protein, fat, carbs, category, image_url)
VALUES 
    ('f1111111-1111-1111-1111-111111111111', 'Grilled Chicken Breast', 165, '100g', 31.0, 3.6, 0.0, 'Poultry', 'https://example.com/chicken.jpg'),
    ('f2222222-2222-2222-2222-222222222222', 'Brown Rice', 215, '1 cup', 5.0, 1.8, 45.0, 'Grains', 'https://example.com/rice.jpg'),
    ('f3333333-3333-3333-3333-333333333333', 'Avocado', 160, '100g', 2.0, 15.0, 9.0, 'Fruits', 'https://example.com/avocado.jpg')
ON CONFLICT (food_name) DO NOTHING;

-- ==========================================
-- 5. INSERT MOCK DATA: consumed_foods
-- ==========================================
INSERT INTO consumed_foods (cf_id, daily_log_id, food_id, amount, amount_type, meal_type)
VALUES 
    (
        'c1111111-1111-1111-1111-111111111111', 
        'a1111111-1111-1111-1111-111111111111', 
        'f1111111-1111-1111-1111-111111111111', 
        200.0, 'gram', 'Lunch'
    ),
    (
        'c2222222-2222-2222-2222-222222222222', 
        'a1111111-1111-1111-1111-111111111111', 
        'f2222222-2222-2222-2222-222222222222', 
        150.0, 'gram', 'Lunch'
    ),
    (
        'c3333333-3333-3333-3333-333333333333', 
        'a2222222-2222-2222-2222-222222222222', 
        'f3333333-3333-3333-3333-333333333333', 
        3.5, 'oz', 'Breakfast'
    );

-- Commit the transaction if everything succeeded
COMMIT;