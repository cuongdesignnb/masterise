import assert from 'node:assert/strict';
import test from 'node:test';
import { parseYouTubeVideoUrl } from '../src/lib/video/videoUrl';

test('parseYouTubeVideoUrl supports watch URLs', () => {
  const parsed = parseYouTubeVideoUrl('https://www.youtube.com/watch?v=abcDEF12345&utm_source=test');

  assert.equal(parsed?.videoId, 'abcDEF12345');
  assert.equal(parsed?.embedUrl, 'https://www.youtube-nocookie.com/embed/abcDEF12345');
});

test('parseYouTubeVideoUrl supports short, embed and shorts URLs', () => {
  assert.equal(parseYouTubeVideoUrl('https://youtu.be/abcDEF12345')?.videoId, 'abcDEF12345');
  assert.equal(parseYouTubeVideoUrl('https://www.youtube.com/embed/abcDEF12345')?.videoId, 'abcDEF12345');
  assert.equal(parseYouTubeVideoUrl('https://www.youtube.com/shorts/abcDEF12345')?.videoId, 'abcDEF12345');
});

test('parseYouTubeVideoUrl rejects invalid URLs and malformed IDs', () => {
  assert.equal(parseYouTubeVideoUrl('https://vimeo.com/123'), null);
  assert.equal(parseYouTubeVideoUrl('https://www.youtube.com/watch?v=short'), null);
  assert.equal(parseYouTubeVideoUrl('not-a-url'), null);
});
