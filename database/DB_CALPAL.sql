-- CreateEnum
CREATE TYPE "user_role" AS ENUM ('user', 'admin');

-- CreateEnum
CREATE TYPE "auth_provider_type" AS ENUM ('Email', 'Google', 'Apple');

-- CreateEnum
CREATE TYPE "gender_type" AS ENUM ('male', 'female');

-- CreateEnum
CREATE TYPE "goal_mode_type" AS ENUM ('lose', 'maintain', 'gain');

-- CreateEnum
CREATE TYPE "activity_level_type" AS ENUM ('sedentary', 'light', 'moderate', 'active', 'very active');

-- CreateEnum
CREATE TYPE "meal_type" AS ENUM ('BREAKFAST', 'LUNCH', 'DINNER');

-- CreateTable
CREATE TABLE "users" (
    "user_id" VARCHAR(255) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "username" VARCHAR(100) NOT NULL,
    "role" "user_role" NOT NULL DEFAULT 'user',
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "user_profiles" (
    "user_id" VARCHAR(255) NOT NULL,
    "auth_provider" "auth_provider_type" NOT NULL,
    "height_cm" DOUBLE PRECISION,
    "weight_kg" DOUBLE PRECISION,
    "date_of_birth" DATE,
    "gender" "gender_type",
    "goal_mode" "goal_mode_type",
    "target_calories" INTEGER,
    "target_protein" INTEGER,
    "target_fat" INTEGER,
    "target_carbs" INTEGER,
    "activity_level" "activity_level_type",
    "bmr" DOUBLE PRECISION,
    "tdee" DOUBLE PRECISION,
    "bmi" DOUBLE PRECISION,
    "bmi_category" VARCHAR(50),
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "user_profiles_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "foods" (
    "food_id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "food_name" VARCHAR(255) NOT NULL,
    "calories_per_serving" INTEGER NOT NULL,
    "serving_size" DOUBLE PRECISION NOT NULL,
    "serving_unit" VARCHAR(50) NOT NULL,
    "protein" DOUBLE PRECISION NOT NULL,
    "fat" DOUBLE PRECISION NOT NULL,
    "carbs" DOUBLE PRECISION NOT NULL,
    "category" VARCHAR(100),
    "image_url" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "foods_pkey" PRIMARY KEY ("food_id")
);

-- CreateTable
CREATE TABLE "food_logs" (
    "food_log_id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" VARCHAR(255) NOT NULL,
    "food_id" UUID,
    "fatsecret_food_id" VARCHAR(100),
    "fatsecret_serving_id" VARCHAR(100),
    "quantity" DOUBLE PRECISION NOT NULL,
    "total_calories" INTEGER,
    "total_protein" DOUBLE PRECISION,
    "total_fat" DOUBLE PRECISION,
    "total_carbs" DOUBLE PRECISION,
    "meal_type" "meal_type" NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "food_logs_pkey" PRIMARY KEY ("food_log_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "idx_users_email" ON "users"("email");

-- CreateIndex
CREATE INDEX "idx_users_username" ON "users"("username");

-- CreateIndex
CREATE UNIQUE INDEX "foods_food_name_key" ON "foods"("food_name");

-- CreateIndex
CREATE INDEX "idx_food_name" ON "foods"("food_name");

-- CreateIndex
CREATE INDEX "idx_food_category" ON "foods"("category");

-- CreateIndex
CREATE INDEX "idx_food_logs_user" ON "food_logs"("user_id");

-- CreateIndex
CREATE INDEX "idx_food_logs_food" ON "food_logs"("food_id");

-- CreateIndex
CREATE INDEX "idx_food_logs_fatsecret" ON "food_logs"("fatsecret_food_id");

-- CreateIndex
CREATE INDEX "idx_food_logs_meal_type" ON "food_logs"("meal_type");

-- CreateIndex
CREATE INDEX "idx_food_logs_created_at" ON "food_logs"("created_at");

-- CreateIndex
CREATE INDEX "idx_food_logs_user_created" ON "food_logs"("user_id", "created_at" DESC);

-- AddForeignKey
ALTER TABLE "user_profiles" ADD CONSTRAINT "user_profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "food_logs" ADD CONSTRAINT "food_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "food_logs" ADD CONSTRAINT "food_logs_food_id_fkey" FOREIGN KEY ("food_id") REFERENCES "foods"("food_id") ON DELETE RESTRICT ON UPDATE CASCADE;
