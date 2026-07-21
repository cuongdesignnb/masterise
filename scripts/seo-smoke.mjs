import http from 'http';

const BASE_URL = process.env.TEST_URL || 'http://localhost:8746';

function fetchUrl(urlPath) {
  return new Promise((resolve, reject) => {
    const fullUrl = urlPath.startsWith('http') ? urlPath : `${BASE_URL}${urlPath}`;
    http.get(fullUrl, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => resolve({ status: res.statusCode, headers: res.headers, body: data }));
    }).on('error', reject);
  });
}

async function runSmokeTests() {
  console.log('\n🔍 ======================================================');
  console.log(`🚀 RUNNING SEO & SCHEMA HARDENING SMOKE TESTS against ${BASE_URL}`);
  console.log('======================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(` ✅ PASS: ${message}`);
      passed++;
    } else {
      console.error(` ❌ FAIL: ${message}`);
      failed++;
    }
  }

  try {
    // Test 1: Robots.txt
    console.log('--- Test Group 1: Robots.txt Specification ---');
    const robotsRes = await fetchUrl('/robots.txt');
    assert(robotsRes.status === 200, 'Robots.txt returns HTTP 200');
    assert(/user-agent:\s*\*/i.test(robotsRes.body), 'Robots.txt contains User-agent: * wildcard block');
    assert(robotsRes.body.includes('Disallow: /admin'), 'Disallow /admin exists');
    assert(robotsRes.body.includes('Disallow: /tai-khoan'), 'Disallow /tai-khoan exists');
    assert(!robotsRes.body.includes('User-agent: Googlebot\nAllow: /'), 'Googlebot group does not bypass disallow rules');

    // Test 2: Sitemap.xml
    console.log('\n--- Test Group 2: Sitemap.xml Cleanliness ---');
    const sitemapRes = await fetchUrl('/sitemap.xml');
    assert(sitemapRes.status === 200, 'Sitemap.xml returns HTTP 200');
    assert(!sitemapRes.body.includes('/ai-summary'), 'Sitemap does not contain noindex route /ai-summary');

    // Test 3: Admin & Account Noindex Security Headers / Meta
    console.log('\n--- Test Group 3: Admin & Private Area Security ---');
    const adminRes = await fetchUrl('/admin');
    assert(adminRes.body.includes('noindex') || adminRes.status === 307 || adminRes.status === 302, 'Admin route returns noindex or authentication redirect');

    // Test 4: Homepage JSON-LD Graph
    console.log('\n--- Test Group 4: Structured Data JSON-LD Graph ---');
    const homeRes = await fetchUrl('/');
    assert(homeRes.status === 200, 'Homepage returns HTTP 200');
    assert(homeRes.body.includes('application/ld+json'), 'Homepage contains application/ld+json script tag');
    assert(homeRes.body.includes('@graph'), 'Homepage JSON-LD contains linked @graph');
    assert(homeRes.body.includes('#organization'), 'Graph contains Organization @id link');
    assert(homeRes.body.includes('#website'), 'Graph contains WebSite @id link');

    console.log('\n======================================================');
    console.log(`📊 SUMMARY: Passed ${passed} tests, Failed ${failed} tests`);
    console.log('======================================================\n');

    if (failed > 0) {
      process.exit(1);
    }
  } catch (err) {
    console.error('⚠️ Smoke test failed due to execution error:', err.message);
    console.log('Note: Ensure the local dev server is running on port 3000 before running smoke tests.');
  }
}

runSmokeTests();
