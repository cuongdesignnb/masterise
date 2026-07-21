import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const ROOT = process.cwd();
const BASE_URL = (process.env.SEO_BASE_URL || process.env.TEST_URL || '').replace(/\/$/, '');
const assets = [
  ['public/brand/operator-logo-512.png', 'png', 512, 512, '/brand/operator-logo-512.png'],
  ['public/icons/icon-192.png', 'png', 192, 192, '/icons/icon-192.png'],
  ['public/icons/icon-512.png', 'png', 512, 512, '/icons/icon-512.png'],
  ['src/app/icon.png', 'png', 512, 512, '/icon.png'],
  ['src/app/apple-icon.png', 'png', 180, 180, '/apple-icon.png'],
  ['public/og-default.jpg', 'jpeg', 1200, 630, '/og-default.jpg'],
];

let failed = 0;
function assert(condition, message) {
  if (condition) console.log(`PASS ${message}`);
  else { failed += 1; console.error(`FAIL ${message}`); }
}

for (const [relativePath, expectedFormat, width, height, publicPath] of assets) {
  const file = path.join(ROOT, relativePath);
  const bytes = await fs.readFile(file);
  const isPng = bytes.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]));
  const isJpeg = bytes[0] === 0xff && bytes[1] === 0xd8 && bytes.at(-2) === 0xff && bytes.at(-1) === 0xd9;
  assert(expectedFormat === 'png' ? isPng : isJpeg, `${relativePath} signature matches ${expectedFormat}`);

  const image = sharp(bytes);
  const [metadata, stats] = await Promise.all([image.metadata(), image.stats()]);
  assert(metadata.format === expectedFormat, `${relativePath} decoded MIME is ${expectedFormat}`);
  assert(metadata.width === width && metadata.height === height, `${relativePath} is ${width}x${height}`);
  assert(bytes.length > 1024, `${relativePath} is not empty or a tiny placeholder`);
  const hasColourVariation = stats.entropy > 0.1
    && stats.channels.some((channel) => channel.max - channel.min > 10 && channel.stdev > 2);
  assert(hasColourVariation, `${relativePath} is not a single-colour image`);

  if (BASE_URL) {
    const response = await fetch(`${BASE_URL}${publicPath}`, { redirect: 'manual', signal: AbortSignal.timeout(10_000) });
    assert(response.status === 200, `${publicPath} returns HTTP 200`);
  }
}

const faviconBytes = await fs.readFile(path.join(ROOT, 'src/app/favicon.ico'));
const faviconCount = faviconBytes.readUInt16LE(4);
const faviconSizes = Array.from({ length: faviconCount }, (_, index) => {
  const offset = 6 + (index * 16);
  return [faviconBytes[offset] || 256, faviconBytes[offset + 1] || 256];
});
assert(faviconBytes.readUInt16LE(0) === 0 && faviconBytes.readUInt16LE(2) === 1, 'src/app/favicon.ico has an ICO signature');
assert(faviconBytes.length > 1024, 'src/app/favicon.ico is not empty or a tiny placeholder');
assert([[16, 16], [32, 32], [48, 48]].every(([width, height]) => faviconSizes.some(([w, h]) => w === width && h === height)), 'src/app/favicon.ico contains 16, 32 and 48 pixel entries');

if (BASE_URL) {
  for (const [publicPath, expectedType, width, height] of [
    ['/favicon.ico', 'image/x-icon', null, null],
    ['/twitter-image', 'image/png', 1200, 630],
  ]) {
    const response = await fetch(`${BASE_URL}${publicPath}`, { redirect: 'manual', signal: AbortSignal.timeout(10_000) });
    assert(response.status === 200, `${publicPath} returns HTTP 200`);
    assert((response.headers.get('content-type') || '').startsWith(expectedType), `${publicPath} returns ${expectedType}`);
    if (width && height && response.status === 200) {
      const metadata = await sharp(Buffer.from(await response.arrayBuffer())).metadata();
      assert(metadata.width === width && metadata.height === height, `${publicPath} is ${width}x${height}`);
    }
  }
}

if (!BASE_URL) console.log('SKIP HTTP asset checks: SEO_BASE_URL/TEST_URL is not set.');
if (failed > 0) process.exit(1);
