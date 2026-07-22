import assert from 'node:assert/strict';
import test from 'node:test';
import { buildOffersNode, normalizeOfferAvailability } from '../src/lib/seo/offerSchema';

const IN_STOCK = 'https://schema.org/InStock';
const OUT_OF_STOCK = 'https://schema.org/OutOfStock';
const PRE_ORDER = 'https://schema.org/PreOrder';
const LIMITED = 'https://schema.org/LimitedAvailability';

test('full InStock URL remains InStock', () => {
  assert.equal(normalizeOfferAvailability(IN_STOCK), IN_STOCK);
});

test('full OutOfStock URL remains OutOfStock', () => {
  assert.equal(normalizeOfferAvailability(OUT_OF_STOCK), OUT_OF_STOCK);
});

test('full PreOrder URL remains PreOrder', () => {
  assert.equal(normalizeOfferAvailability(PRE_ORDER), PRE_ORDER);
});

test('full LimitedAvailability URL remains LimitedAvailability', () => {
  assert.equal(normalizeOfferAvailability(LIMITED), LIMITED);
});

test('internal sold_out maps to OutOfStock', () => {
  assert.equal(normalizeOfferAvailability('sold_out'), OUT_OF_STOCK);
});

test('unknown availability is omitted instead of defaulting to InStock', () => {
  assert.equal(normalizeOfferAvailability('available_soon'), undefined);
  assert.equal(buildOffersNode('https://example.test/project', { price: 10, availability: 'available_soon' })?.availability, undefined);
});

test('empty availability is omitted', () => {
  assert.equal(normalizeOfferAvailability('  '), undefined);
  assert.equal(buildOffersNode('https://example.test/project', { price: 10, availability: '' })?.availability, undefined);
});

test('rendered project Product schema preserves the Admin OutOfStock URL', () => {
  const offer = buildOffersNode('https://example.test/project', {
    price: 8_500_000_000,
    priceCurrency: 'VND',
    availability: OUT_OF_STOCK,
  });
  const renderedSchema = JSON.parse(JSON.stringify({
    '@context': 'https://schema.org',
    '@graph': [{
      '@type': 'Product',
      '@id': 'https://example.test/project#product',
      name: 'Test project',
      offers: offer,
    }],
  }));

  assert.equal(renderedSchema['@graph'][0].offers.availability, OUT_OF_STOCK);
  assert.doesNotMatch(JSON.stringify(renderedSchema), /schema\.org\/InStock/);
});
