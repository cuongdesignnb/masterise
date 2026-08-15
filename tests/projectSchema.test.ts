import assert from 'node:assert/strict';
import test from 'node:test';
import { buildOperatorNode, buildProductNode, buildWebPageNode } from '../src/lib/seo/schema';

test('project Product schema keeps crawlable image URLs and review data', () => {
  const node = buildProductNode('https://example.test/project', {
    name: 'Example project',
    description: 'A real project description.',
    images: ['https://cdn.example.test/project.webp'],
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: 4.8,
      ratingCount: 12,
      reviewCount: 12,
    },
  });

  assert.deepEqual(node.image, ['https://cdn.example.test/project.webp']);
  assert.equal(node.aggregateRating?.ratingValue, 4.8);
  assert.equal('review' in node, false);
});

test('project WebPage links its primary image only when one is defined', () => {
  const node = buildWebPageNode(
    'https://example.test/project',
    'Example project',
    'A real project description.',
    { imageId: 'https://example.test/project#primaryimage' },
  );

  assert.deepEqual(node.primaryImageOfPage, {
    '@id': 'https://example.test/project#primaryimage',
  });
});

test('operator schema exposes configured business image and price range', () => {
  const node = buildOperatorNode({
    enabled: true,
    type: 'RealEstateAgent',
    name: 'Example Homes',
    url: 'https://example.test',
    logoUrl: 'https://example.test/logo.png',
    telephone: '+84123456789',
    priceRange: '$$$',
    sameAs: [],
  });

  assert.equal(node?.image, 'https://example.test/logo.png');
  assert.equal(node?.telephone, '+84123456789');
  assert.equal(node?.priceRange, '$$$');
});

test('operator schema supplies a valid default price range when not configured', () => {
  const node = buildOperatorNode({
    enabled: true,
    type: 'RealEstateAgent',
    name: 'Example Homes',
    url: 'https://example.test',
    sameAs: [],
  });

  assert.equal(node?.priceRange, '$$$');
});
