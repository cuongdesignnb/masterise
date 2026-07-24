import assert from 'node:assert/strict';
import test from 'node:test';
import { analyzeGraph, formatDanglingReferences } from '../scripts/seo-graph-validator.mjs';

const CANONICAL = 'https://masterise-homes.net.vn';
const JOB_URL = `${CANONICAL}/tuyen-dung/sales-manager`;

function graph(nodes) {
  return [{ '@context': 'https://schema.org', '@graph': nodes }];
}

function ids(nodes) {
  return analyzeGraph(graph(nodes), CANONICAL).ids;
}

test('homepage without BreadcrumbList has no breadcrumb reference', () => {
  const analysis = analyzeGraph(graph([
    { '@type': 'WebSite', '@id': `${CANONICAL}/#website` },
    {
      '@type': 'WebPage',
      '@id': `${CANONICAL}#webpage`,
      url: CANONICAL,
      isPartOf: { '@id': `${CANONICAL}/#website` },
    },
  ]), CANONICAL);

  assert.equal(analysis.danglingReferences.length, 0);
  assert(!JSON.stringify(analysis.nodes).includes('#breadcrumb'));
});

test('job schema disabled has no #job reference', () => {
  const nodes = [
    { '@type': 'WebSite', '@id': `${CANONICAL}/#website` },
    {
      '@type': 'WebPage',
      '@id': `${JOB_URL}#webpage`,
      url: JOB_URL,
      isPartOf: { '@id': `${CANONICAL}/#website` },
      breadcrumb: { '@id': `${JOB_URL}#breadcrumb` },
    },
    { '@type': 'BreadcrumbList', '@id': `${JOB_URL}#breadcrumb` },
  ];

  assert.equal(analyzeGraph(graph(nodes), JOB_URL).danglingReferences.length, 0);
  assert(!JSON.stringify(nodes).includes(`${JOB_URL}#job`));
});

test('contact page without Organization node has no organization reference', () => {
  const contactUrl = `${CANONICAL}/lien-he`;
  const nodes = [
    { '@type': 'WebSite', '@id': `${CANONICAL}/#website` },
    {
      '@type': 'ContactPage',
      '@id': `${contactUrl}#webpage`,
      url: contactUrl,
      isPartOf: { '@id': `${CANONICAL}/#website` },
      breadcrumb: { '@id': `${contactUrl}#breadcrumb` },
    },
    { '@type': 'BreadcrumbList', '@id': `${contactUrl}#breadcrumb` },
  ];

  assert.equal(analyzeGraph(graph(nodes), contactUrl).danglingReferences.length, 0);
  assert(!JSON.stringify(nodes).includes(`${CANONICAL}/#organization`));
});

test('ineligible job has no #job reference', () => {
  const nodes = [
    { '@type': 'WebSite', '@id': `${CANONICAL}/#website` },
    {
      '@type': 'WebPage',
      '@id': `${JOB_URL}#webpage`,
      url: JOB_URL,
      isPartOf: { '@id': `${CANONICAL}/#website` },
      breadcrumb: { '@id': `${JOB_URL}#breadcrumb` },
    },
    { '@type': 'BreadcrumbList', '@id': `${JOB_URL}#breadcrumb` },
  ];

  assert.equal(analyzeGraph(graph(nodes), JOB_URL).danglingReferences.length, 0);
  assert(!ids(nodes).includes(`${JOB_URL}#job`));
});

test('eligible job with flag enabled has #job reference and matching JobPosting node', () => {
  const nodes = [
    { '@type': 'WebSite', '@id': `${CANONICAL}/#website` },
    {
      '@type': 'WebPage',
      '@id': `${JOB_URL}#webpage`,
      url: JOB_URL,
      isPartOf: { '@id': `${CANONICAL}/#website` },
      about: { '@id': `${JOB_URL}#job` },
      breadcrumb: { '@id': `${JOB_URL}#breadcrumb` },
    },
    { '@type': 'BreadcrumbList', '@id': `${JOB_URL}#breadcrumb` },
    { '@type': 'JobPosting', '@id': `${JOB_URL}#job`, title: 'Sales Manager' },
  ];

  const analysis = analyzeGraph(graph(nodes), JOB_URL);
  assert.equal(analysis.danglingReferences.length, 0);
  assert(ids(nodes).includes(`${JOB_URL}#job`));
});

test('production-origin dangling @id fails while fetched from localhost', () => {
  const analysis = analyzeGraph(graph([
    { '@type': 'WebSite', '@id': `${CANONICAL}/#website` },
    {
      '@type': 'WebPage',
      '@id': `${CANONICAL}#webpage`,
      url: CANONICAL,
      isPartOf: { '@id': `${CANONICAL}/#website` },
      breadcrumb: { '@id': `${CANONICAL}#breadcrumb` },
    },
  ]), CANONICAL);

  assert.equal(analysis.danglingReferences.length, 1);
  assert.equal(analysis.danglingReferences[0].id, `${CANONICAL}#breadcrumb`);
  assert.match(formatDanglingReferences(analysis.danglingReferences), /referenced by/);
});

test('matching production-origin reference passes', () => {
  const analysis = analyzeGraph(graph([
    { '@type': 'WebSite', '@id': `${CANONICAL}/#website` },
    {
      '@type': 'WebPage',
      '@id': `${CANONICAL}#webpage`,
      url: CANONICAL,
      isPartOf: { '@id': `${CANONICAL}/#website` },
      breadcrumb: { '@id': `${CANONICAL}#breadcrumb` },
    },
    { '@type': 'BreadcrumbList', '@id': `${CANONICAL}#breadcrumb` },
  ]), CANONICAL);

  assert.equal(analysis.danglingReferences.length, 0);
});

test('video watch page references a matching VideoObject node only on the watch URL', () => {
  const videoUrl = `${CANONICAL}/video/lumiere-demo`;
  const nodes = [
    { '@type': 'WebSite', '@id': `${CANONICAL}/#website` },
    {
      '@type': 'WebPage',
      '@id': `${videoUrl}#webpage`,
      url: videoUrl,
      isPartOf: { '@id': `${CANONICAL}/#website` },
      about: { '@id': `${videoUrl}#video` },
      breadcrumb: { '@id': `${videoUrl}#breadcrumb` },
    },
    { '@type': 'BreadcrumbList', '@id': `${videoUrl}#breadcrumb` },
    {
      '@type': 'VideoObject',
      '@id': `${videoUrl}#video`,
      name: 'Video dự án',
    },
  ];

  const analysis = analyzeGraph(graph(nodes), videoUrl);
  assert.equal(analysis.danglingReferences.length, 0);
  assert(ids(nodes).includes(`${videoUrl}#video`));
});
