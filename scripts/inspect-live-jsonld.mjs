import parserPackage from 'next/dist/compiled/node-html-parser/index.js';
import { analyzeGraph, formatDanglingReferences } from './seo-graph-validator.mjs';

const { parse } = parserPackage;
const TIMEOUT_MS = Number(process.env.SEO_HTTP_TIMEOUT_MS || 15_000);
const DEFAULT_URLS = [
  'https://masterise-homes.net.vn/',
  'https://masterise-homes.net.vn/lumiere-orient-pearl',
];
const USER_AGENTS = {
  browser: 'Mozilla/5.0',
  googlebot: 'Googlebot',
};

function usage() {
  console.error('Usage: node scripts/inspect-live-jsonld.mjs [url ...] [--user-agent browser|googlebot|both]');
}

function parseArgs(argv) {
  const urls = [];
  let userAgent = 'both';
  for (let index = 0; index < argv.length; index += 1) {
    const value = argv[index];
    if (value === '--user-agent') {
      userAgent = argv[index + 1] || 'both';
      index += 1;
      continue;
    }
    if (value.startsWith('-')) {
      usage();
      process.exitCode = 2;
      return { urls: [], userAgent };
    }
    urls.push(value);
  }
  if (!['browser', 'googlebot', 'both'].includes(userAgent)) {
    usage();
    process.exitCode = 2;
    return { urls: [], userAgent };
  }
  return { urls: urls.length ? urls : DEFAULT_URLS, userAgent };
}

function userAgents(selection) {
  return selection === 'both' ? Object.entries(USER_AGENTS) : [[selection, USER_AGENTS[selection]]];
}

function parseJsonLd(root, url, userAgent) {
  const scripts = root.querySelectorAll('script[type="application/ld+json"]');
  const documents = [];
  const errors = [];
  scripts.forEach((script, index) => {
    try {
      documents.push(JSON.parse(script.textContent));
    } catch (error) {
      errors.push({ script: index + 1, message: error instanceof Error ? error.message : String(error) });
    }
  });
  if (errors.length) {
    console.error(`[${userAgent}] ${url} invalid JSON-LD:`, JSON.stringify(errors));
  }
  return { documents, errors };
}

function flattenNodes(documents) {
  return documents.flatMap((document) => (
    Array.isArray(document?.['@graph']) ? document['@graph'] : [document]
  )).filter((node) => node && typeof node === 'object');
}

async function inspect(url, userAgent) {
  const response = await fetch(url, {
    headers: { Accept: 'text/html,application/xhtml+xml', 'User-Agent': userAgent },
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });
  const html = await response.text();
  const root = parse(html, { lowerCaseTagName: true, comment: false });
  const canonical = root.querySelector('link[rel="canonical"]')?.getAttribute('href') || '';
  const robots = root.querySelector('meta[name="robots"]')?.getAttribute('content') || '';
  const { documents, errors } = parseJsonLd(root, url, userAgent);
  const nodes = flattenNodes(documents);
  const analysis = documents.length ? analyzeGraph(documents, canonical) : null;
  const types = [...new Set(nodes.flatMap((node) => {
    const value = node['@type'];
    return Array.isArray(value) ? value : value ? [value] : [];
  }))];

  console.log(JSON.stringify({
    url,
    userAgent,
    status: response.status,
    canonical,
    robots,
    jsonLdScriptCount: root.querySelectorAll('script[type="application/ld+json"]').length,
    types,
    ids: analysis?.ids || [],
    duplicateIds: analysis?.duplicateIds || [],
    danglingReferences: analysis?.danglingReferences || [],
  }, null, 2));

  if (response.status !== 200) return false;
  if (!documents.length) return false;
  if (errors.length) return false;
  if (analysis?.duplicateIds.length || analysis?.danglingReferences.length) {
    if (analysis.danglingReferences.length) console.error(formatDanglingReferences(analysis.danglingReferences));
    return false;
  }
  return true;
}

const { urls, userAgent } = parseArgs(process.argv.slice(2));
if (process.exitCode !== 2) {
  let passed = true;
  for (const url of urls) {
    for (const [label, agent] of userAgents(userAgent)) {
      try {
        passed = await inspect(url, agent) && passed;
      } catch (error) {
        passed = false;
        console.error(`[${label}] ${url} request failed:`, error instanceof Error ? error.message : String(error));
      }
    }
  }
  if (!passed) process.exitCode = 1;
}
