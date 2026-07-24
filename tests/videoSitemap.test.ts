import assert from 'node:assert/strict';
import test from 'node:test';
import { buildVideoSitemapXml } from '../src/lib/video/videoSitemap';

test('buildVideoSitemapXml emits video sitemap XML with escaped values', () => {
  const xml = buildVideoSitemapXml([{
    loc: 'https://masterise-homes.net.vn/video/demo',
    thumbnailUrl: 'https://img.youtube.com/vi/abcDEF12345/maxresdefault.jpg',
    title: 'Video & dự án',
    description: 'Mô tả <đầy đủ>',
    playerUrl: 'https://www.youtube-nocookie.com/embed/abcDEF12345',
    publicationDate: '2026-07-24T00:00:00.000Z',
  }]);

  assert.match(xml, /xmlns:video="http:\/\/www\.google\.com\/schemas\/sitemap-video\/1\.1"/);
  assert.match(xml, /<video:title>Video &amp; dự án<\/video:title>/);
  assert.match(xml, /<video:description>Mô tả &lt;đầy đủ&gt;<\/video:description>/);
  assert.match(xml, /<video:player_loc>https:\/\/www\.youtube-nocookie\.com\/embed\/abcDEF12345<\/video:player_loc>/);
});
