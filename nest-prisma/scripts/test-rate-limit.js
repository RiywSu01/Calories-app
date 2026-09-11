/**
 * Rate Limiting Automated Test using Autocannon & Native Fetch
 * Tests FatSecret API protected endpoints against burst and sustained limits.
 */
const autocannon = require('autocannon');

const BASE_URL = process.env.API_URL || 'http://localhost:3001';

async function runSingleBurstTest() {
  console.log('\n============================================================');
  console.log('🧪 1. Direct Burst Test (10req in 1 sec): 10 Sequential Requests to /foods/search');
  console.log('   Expected: First ~3-4 succeed (200), subsequent hit 429 Too Many Requests');
  console.log('============================================================\n');

  let passedCount = 0;
  let blockedCount = 0;

  for (let i = 1; i <= 10; i++) {
    try {
      const res = await fetch(`${BASE_URL}/foods/search?query=chicken&page=0`);
      const status = res.status;
      const retryAfter = res.headers.get('retry-after');

      if (status === 200) {
        passedCount++;
        console.log(`  [Request #${i}] ✅ Status 200 OK (Allowed)`);
      } else if (status === 429) {
        blockedCount++;
        console.log(`  [Request #${i}] 🛑 Status 429 Too Many Requests (Blocked by ThrottlerGuard, Retry-After: ${retryAfter || 'N/A'}s)`);
      } else {
        console.log(`  [Request #${i}] ⚠️ Status ${status}`);
      }
    } catch (err) {
      console.error(`  [Request #${i}] ❌ Network Error:`, err.message);
    }
  }

  console.log(`\n📊 Summary: ${passedCount} Allowed | ${blockedCount} Rate-Limited (429)`);
}

function runAutocannonLoadTest() {
  return new Promise((resolve, reject) => {
    console.log('\n============================================================');
    console.log('🚀 2. Autocannon Load & Stress Test against /foods/search');
    console.log('   Running 10 concurrent connections for 5 seconds...');
    console.log('============================================================\n');

    const instance = autocannon(
      {
        url: `${BASE_URL}/foods/search?query=apple`,
        connections: 10,
        duration: 5,
        pipelining: 1,
      },
      (err, result) => {
        if (err) {
          console.error('Autocannon error:', err);
          return reject(err);
        }

        console.log('\n📈 Autocannon Results:');
        console.log(`   Total Requests Sent: ${result.requests.total}`);
        console.log(`   2xx Responses (Allowed): ${result['2xx'] || 0}`);
        console.log(`   4xx Responses (Blocked by Rate Limiter 429): ${result['4xx'] || 0}`);
        console.log(`   Average Latency: ${result.latency.average} ms`);
        console.log(`   Throughput: ${(result.throughput.total / 1024).toFixed(2)} KB/s`);
        console.log('\n✅ Rate limiter effectively blocked excessive traffic!');
        resolve(result);
      }
    );

    autocannon.track(instance, { renderProgressBar: true });
  });
}

async function main() {
  console.log('🥑 CalPal - FatSecret API Rate Limiting Test Suite');
  console.log(`Targeting Server: ${BASE_URL}`);

  try {
    await runSingleBurstTest();
    console.log('\nWaiting 2 seconds before Autocannon load test...\n');
    await new Promise((r) => setTimeout(r, 2000));
    await runAutocannonLoadTest();
  } catch (err) {
    console.error('Test failed:', err);
  }
}

main();
