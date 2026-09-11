#!/bin/sh
set -e

echo "🚀 Starting CalPal NestJS Backend..."

# Synchronize PostgreSQL schema
echo "📦 Running Prisma DB push..."
npx prisma db push --url "$DATABASE_URL" --accept-data-loss

# Start NestJS Production Application
echo "✨ Starting NestJS Server..."
exec node dist/main.js
