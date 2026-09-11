#!/usr/bin/env bash

# CalPal - FatSecret API Rate Limiting Curl Test Script
# Usage: ./scripts/test-rate-limit.sh [optional_url]

API_URL="${1:-http://localhost:3001}"

echo "============================================================"
echo "🥑 Testing FatSecret Rate Limiting on $API_URL/foods/search"
echo "   Sending 10 rapid burst requests in a loop..."
echo "============================================================"
echo ""

SUCCESS_COUNT=0
BLOCKED_COUNT=0

for i in {1..10}; do
  HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$API_URL/foods/search?query=chicken&page=0")
  
  if [ "$HTTP_STATUS" -eq 200 ]; then
    echo "  [Request #$i] ✅ HTTP 200 OK (Allowed)"
    ((SUCCESS_COUNT++))
  elif [ "$HTTP_STATUS" -eq 429 ]; then
    echo "  [Request #$i] 🛑 HTTP 429 Too Many Requests (Blocked by ThrottlerGuard)"
    ((BLOCKED_COUNT++))
  else
    echo "  [Request #$i] ⚠️ HTTP $HTTP_STATUS"
  fi
done

echo ""
echo "============================================================"
echo "📊 Results: $SUCCESS_COUNT Allowed (200) | $BLOCKED_COUNT Rate-Limited (429)"
echo "============================================================"
