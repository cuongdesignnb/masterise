import assert from 'node:assert/strict';
import test from 'node:test';
import { buildVideoObjectNode } from '../src/lib/seo/videoSchema';

const CANONICAL = 'https://masterise-homes.net.vn/video/lumiere-demo';

test('buildVideoObjectNode emits a complete VideoObject for eligible videos', () => {
  const node = buildVideoObjectNode(CANONICAL, {
    name: 'Video dự án',
    description: 'Mô tả video dự án.',
    thumbnailUrl: 'https://img.youtube.com/vi/abcDEF12345/maxresdefault.jpg',
    uploadDate: '2026-07-24T00:00:00.000Z',
    embedUrl: 'https://www.youtube-nocookie.com/embed/abcDEF12345',
    duration: 'PT2M10S',
  });

  assert.equal(node?.['@type'], 'VideoObject');
  assert.equal(node?.['@id'], `${CANONICAL}#video`);
  assert.deepEqual(node?.thumbnailUrl, ['https://img.youtube.com/vi/abcDEF12345/maxresdefault.jpg']);
  assert.equal(node?.uploadDate, '2026-07-24T00:00:00.000Z');
  assert.equal(node?.embedUrl, 'https://www.youtube-nocookie.com/embed/abcDEF12345');
  assert.equal(node?.duration, 'PT2M10S');
});

test('buildVideoObjectNode returns null instead of fabricating missing required metadata', () => {
  assert.equal(buildVideoObjectNode(CANONICAL, {
    name: 'Video dự án',
    description: '',
    thumbnailUrl: 'https://img.youtube.com/vi/abcDEF12345/maxresdefault.jpg',
    uploadDate: '2026-07-24T00:00:00.000Z',
    embedUrl: 'https://www.youtube-nocookie.com/embed/abcDEF12345',
  }), null);
});

test('buildVideoObjectNode does not mutate input data', () => {
  const input = {
    name: '  Video dự án  ',
    description: '  Mô tả video dự án.  ',
    thumbnailUrl: 'https://img.youtube.com/vi/abcDEF12345/maxresdefault.jpg',
    uploadDate: '2026-07-24T00:00:00.000Z',
    embedUrl: 'https://www.youtube-nocookie.com/embed/abcDEF12345',
  };

  buildVideoObjectNode(CANONICAL, input);

  assert.equal(input.name, '  Video dự án  ');
  assert.equal(input.description, '  Mô tả video dự án.  ');
});
