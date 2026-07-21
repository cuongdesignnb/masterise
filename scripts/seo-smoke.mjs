import parserPackage from 'next/dist/compiled/node-html-parser/index.js';

const { parse } = parserPackage;
const BASE_URL = (process.env.SEO_BASE_URL || process.env.TEST_URL || 'http://localhost:8746').replace(/\/$/, '');
const STRICT = process.env.SEO_SMOKE_STRICT !== undefined
  ? process.env.SEO_SMOKE_STRICT === '1'
  : process.env.CI === 'true';
const TIMEOUT_MS = Number(process.env.SEO_HTTP_TIMEOUT_MS || 15_000);
const MAX_REDIRECTS = 5;

const fixtures = {
  projectNoProduct: process.env.SEO_PROJECT_NO_PRODUCT_SLUG,
  projectOffer: process.env.SEO_PROJECT_OFFER_SLUG,
  projectReview: process.env.SEO_PROJECT_REVIEW_SLUG,
  news: process.env.SEO_NEWS_SLUG,
  event: process.env.SEO_EVENT_SLUG,
  activeJob: process.env.SEO_ACTIVE_JOB_SLUG,
  expiredJob: process.env.SEO_EXPIRED_JOB_SLUG,
  page: process.env.SEO_PAGE_SLUG,
};

let passed = 0;
let failed = 0;
let skipped = 0;

function assert(condition, message, details = '') {
  if (condition) {
    passed += 1;
    console.log(`PASS ${message}`);
    return;
  }
  failed += 1;
  console.error(`FAIL ${message}${details ? ` — ${details}` : ''}`);
}

function skip(message) {
  skipped += 1;
  console.log(`SKIP ${message}`);
}

async function fetchWithRedirects(pathname) {
  let url = new URL(pathname, `${BASE_URL}/`);
  const redirects = [];

  for (let index = 0; index <= MAX_REDIRECTS; index += 1) {
    const response = await fetch(url, {
      headers: { Accept: 'text/html,application/xhtml+xml' },
      redirect: 'manual',
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    const location = response.headers.get('location');
    if (response.status < 300 || response.status >= 400 || !location) {
      return {
        status: response.status,
        headers: response.headers,
        body: await response.text(),
        finalUrl: url,
        redirects,
      };
    }
    redirects.push({ status: response.status, from: url.href, to: location });
    url = new URL(location, url);
  }

  throw new Error(`Too many redirects for ${pathname}`);
}

function parseDocument(body) {
  return parse(body, { lowerCaseTagName: true, comment: false });
}

function parseJsonLd(root, label) {
  const scripts = root.querySelectorAll('script[type="application/ld+json"]');
  return scripts.map((script, index) => {
    try {
      return JSON.parse(script.textContent);
    } catch (error) {
      assert(false, `${label} JSON-LD script ${index + 1} parses`, error instanceof Error ? error.message : String(error));
      return null;
    }
  }).filter(Boolean);
}

function collectGraphNodes(documents) {
  return documents.flatMap((document) => Array.isArray(document?.['@graph']) ? document['@graph'] : [document]);
}

function collectLocalReferences(value, references = []) {
  if (Array.isArray(value)) {
    value.forEach((entry) => collectLocalReferences(entry, references));
  } else if (value && typeof value === 'object') {
    for (const [key, entry] of Object.entries(value)) {
      if (key === '@id' && typeof entry === 'string' && entry.startsWith(BASE_URL)) references.push(entry);
      else collectLocalReferences(entry, references);
    }
  }
  return references;
}

function validateGraph(documents, label) {
  const nodes = collectGraphNodes(documents).filter((node) => node && typeof node === 'object');
  const ids = nodes.map((node) => node['@id']).filter((id) => typeof id === 'string');
  assert(new Set(ids).size === ids.length, `${label} graph has unique @id values`);

  const defined = new Set(ids);
  const references = collectLocalReferences(documents).filter((id) => !defined.has(id));
  assert(references.length === 0, `${label} graph has no dangling local @id`, references.join(', '));
  assert(nodes.every((node) => Object.keys(node).length > 0), `${label} graph has no empty nodes`);
}

function robotsContent(root) {
  return root.querySelector('meta[name="robots"]')?.getAttribute('content')?.toLowerCase() || '';
}

async function validateHtmlRoute(pathname, { label = pathname, expectedStatus = 200, noindex = false, follow = true, maxRedirects = 0 } = {}) {
  const result = await fetchWithRedirects(pathname);
  assert(result.status === expectedStatus, `${label} returns HTTP ${expectedStatus}`, `got ${result.status}`);
  assert(result.redirects.length <= maxRedirects, `${label} redirect count <= ${maxRedirects}`, `got ${result.redirects.length}`);
  if (result.status !== 200) return { ...result, root: null, jsonLd: [] };

  const root = parseDocument(result.body);
  const title = root.querySelector('title')?.textContent.trim() || '';
  const canonical = root.querySelector('link[rel="canonical"]')?.getAttribute('href') || '';
  const description = root.querySelector('meta[name="description"]')?.getAttribute('content') || '';
  const robots = robotsContent(root);
  const jsonLd = parseJsonLd(root, label);

  assert(title.length > 0, `${label} has a title`);
  assert(!title.includes('Masterise Homes | Masterise Homes'), `${label} title has no duplicate brand`);
  assert(canonical.startsWith('http'), `${label} has an absolute canonical`);
  assert(description.trim().length > 0, `${label} has a meta description`);
  assert(root.querySelectorAll('h1').length === 1, `${label} has exactly one H1`, `got ${root.querySelectorAll('h1').length}`);
  assert(!!root.querySelector('meta[property="og:title"]'), `${label} has Open Graph title`);
  assert(!!root.querySelector('meta[name="twitter:card"]'), `${label} has Twitter card`);
  assert(noindex ? robots.includes('noindex') : !robots.includes('noindex'), `${label} robots index policy is correct`, robots);
  if (noindex) assert(follow ? robots.includes('follow') && !robots.includes('nofollow') : robots.includes('nofollow'), `${label} robots follow policy is correct`, robots);
  if (jsonLd.length > 0) validateGraph(jsonLd, label);

  return { ...result, root, jsonLd };
}

async function validateFixture(name, pathFactory, options = {}) {
  const value = fixtures[name];
  if (!value) {
    const message = `${name} fixture missing (${options.envName || name})`;
    if (STRICT && options.required !== false) assert(false, message);
    else skip(message);
    return null;
  }
  return validateHtmlRoute(pathFactory(value), options);
}

async function run() {
  console.log(`SEO smoke base URL: ${BASE_URL}`);
  console.log(`Strict fixtures: ${STRICT}`);

  const robots = await fetchWithRedirects('/robots.txt');
  assert(robots.status === 200, 'robots.txt returns HTTP 200');
  assert(/user-agent:\s*\*/i.test(robots.body), 'robots.txt contains wildcard user agent');
  assert(/disallow:\s*\/api\//i.test(robots.body), 'robots.txt blocks /api/');

  const sitemap = await fetchWithRedirects('/sitemap.xml');
  assert(sitemap.status === 200, 'sitemap.xml returns HTTP 200');
  assert(!sitemap.body.includes('/ai-summary'), 'sitemap excludes /ai-summary');
  const sitemapRoot = parseDocument(sitemap.body);
  const sitemapPageUrls = sitemapRoot.querySelectorAll('url > loc').map((node) => node.textContent.trim());
  assert(sitemapPageUrls.every((url) => !url.includes('?')), 'sitemap excludes query page URLs');

  await validateHtmlRoute('/', { label: 'homepage' });
  await validateHtmlRoute('/du-an', { label: 'project listing' });
  await validateHtmlRoute('/du-an?page=2', { label: 'project pagination', noindex: true });
  await validateHtmlRoute('/du-an?q=test', { label: 'project search', noindex: true });
  await validateHtmlRoute('/du-an?region=test', { label: 'project region filter', noindex: true });
  await validateHtmlRoute('/tin-tuc', { label: 'news listing' });
  await validateHtmlRoute('/tin-tuc?page=2', { label: 'news pagination', noindex: true });
  await validateHtmlRoute('/tin-tuc?q=test', { label: 'news search', noindex: true });
  await validateHtmlRoute('/dau-tu', { label: 'investment listing' });
  await validateHtmlRoute('/tuyen-dung', { label: 'career listing' });
  await validateHtmlRoute('/gioi-thieu', { label: 'about page' });
  await validateHtmlRoute('/lien-he', { label: 'contact page' });
  await validateHtmlRoute('/chuyen-trang', { label: 'custom page listing' });

  await validateFixture('projectNoProduct', (slug) => `/${slug}`, { label: 'project without Product', envName: 'SEO_PROJECT_NO_PRODUCT_SLUG' });
  await validateFixture('projectOffer', (slug) => `/${slug}`, { label: 'project with Offer', envName: 'SEO_PROJECT_OFFER_SLUG' });
  await validateFixture('projectReview', (slug) => `/${slug}`, { label: 'project with reviews', envName: 'SEO_PROJECT_REVIEW_SLUG' });
  await validateFixture('news', (slug) => `/${slug}`, { label: 'news detail', envName: 'SEO_NEWS_SLUG' });
  await validateFixture('event', (slug) => `/${slug}`, { label: 'event detail', envName: 'SEO_EVENT_SLUG' });
  await validateFixture('activeJob', (slug) => `/tuyen-dung/${slug}`, { label: 'active job', envName: 'SEO_ACTIVE_JOB_SLUG' });
  await validateFixture('expiredJob', (slug) => `/tuyen-dung/${slug}`, { label: 'expired job', expectedStatus: 404, envName: 'SEO_EXPIRED_JOB_SLUG' });
  await validateFixture('page', (slug) => `/chuyen-trang/${slug}`, { label: 'custom page detail', envName: 'SEO_PAGE_SLUG' });

  const admin = await fetchWithRedirects('/admin');
  assert([200, 302, 307, 308].includes(admin.status), 'admin is noindex HTML or authentication redirect', `got ${admin.status}`);
  if (admin.status === 200) {
    const root = parseDocument(admin.body);
    assert(robotsContent(root).includes('noindex') && robotsContent(root).includes('nofollow'), 'admin uses noindex,nofollow');
  }

  const unknown = await fetchWithRedirects('/unknown-404');
  assert(unknown.status === 404, 'unknown route returns HTTP 404', `got ${unknown.status}`);

  console.log(`SUMMARY passed=${passed} failed=${failed} skipped=${skipped}`);
  if (failed > 0) process.exitCode = 1;
}

run().catch((error) => {
  console.error('SEO smoke execution error:', error);
  process.exitCode = 1;
});
