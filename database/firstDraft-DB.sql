-- ==========================================
-- 1. SAFETY: DROP EXISTING TABLES
-- (Must be done in reverse order of creation)
-- ==========================================
DROP TABLE IF EXISTS consumed_foods CASCADE;
DROP TABLE IF EXISTS daily_log CASCADE;
DROP TABLE IF EXISTS foods CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- ==========================================
-- 2. CREATE TABLES
-- ==========================================

-- Create the 'users' table
CREATE TABLE users (
    id VARCHAR(255) PRIMARY KEY,
    username VARCHAR(255) NOT NULL,
    createAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create the 'foods' table
CREATE TABLE foods (
    id VARCHAR(255) PRIMARY KEY,
    food_name VARCHAR(255) NOT NULL,
    calories INTEGER NOT NULL,
    category VARCHAR(255) NOT NULL, 
    createAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create the 'daily_log' table
CREATE TABLE daily_log (
    id VARCHAR(255) PRIMARY KEY,
    log_date DATE NOT NULL,
    total_calories INTEGER DEFAULT 0,
    user_id VARCHAR(255) NOT NULL,
    createAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_user
        FOREIGN KEY (user_id) 
        REFERENCES users(id)
        ON DELETE CASCADE
);

-- Create the 'consumed_foods' table
CREATE TABLE consumed_foods (
    id VARCHAR(255) PRIMARY KEY,
    quantity DECIMAL(10, 2) NOT NULL,
    food_id VARCHAR(255) NOT NULL,
    daily_log_id VARCHAR(255) NOT NULL,
    createAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_food
        FOREIGN KEY (food_id) 
        REFERENCES foods(id)
        ON DELETE RESTRICT,
    CONSTRAINT fk_daily_log
        FOREIGN KEY (daily_log_id) 
        REFERENCES daily_log(id)
        ON DELETE CASCADE
);

-- ==========================================
-- 3. INSERT MOCK DATA
-- ==========================================

-- Insert mock users
INSERT INTO users (id, username) VALUES 
('usr_001', 'supawit'),
('usr_002', 'gym_bro_99');

-- Insert mock foods 
INSERT INTO foods (id, food_name, calories, category) VALUES 
('fd_001', 'Chicken Breast (100g)', 165, 'Protein'),
('fd_002', 'Pad Kra Pao Moo Kai Dao', 600, 'Main Dish'),
('fd_003', 'Whey Protein (1 Scoop)', 120, 'Supplement'),
('fd_004', 'Jasmine Rice (100g)', 130, 'Carbohydrate');

-- Insert mock daily logs 
INSERT INTO daily_log (id, log_date, total_calories, user_id) VALUES 
('log_001', CURRENT_DATE, 1110, 'usr_001'),
('log_002', CURRENT_DATE, 0, 'usr_002'); 

-- Insert mock consumed foods
INSERT INTO consumed_foods (id, quantity, food_id, daily_log_id) VALUES 
('cf_001', 2.00, 'fd_001', 'log_001'), 
('cf_002', 1.00, 'fd_002', 'log_001'), 
('cf_003', 1.50, 'fd_003', 'log_001');

