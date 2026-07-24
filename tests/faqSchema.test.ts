import assert from 'node:assert/strict';
import test from 'node:test';
import { buildFaqPageNode } from '../src/lib/seo/faqSchema';

const CANONICAL = 'https://masterise-homes.net.vn/lien-he';

type FaqNode = {
  '@type': string;
  '@id': string;
  mainEntity: Array<{
    name: string;
    acceptedAnswer: { text: string };
  }>;
};

test('buildFaqPageNode emits FAQPage with visible questions and answers', () => {
  const node = buildFaqPageNode(CANONICAL, [
    { question: ' Hotline ở đâu? ', answer: ' Gọi phòng kinh doanh. ' },
    { question: 'Có Zalo không?', answer: 'Có.' },
  ]) as FaqNode;

  assert.equal(node?.['@type'], 'FAQPage');
  assert.equal(node?.['@id'], `${CANONICAL}#faq`);
  assert.equal(node?.mainEntity.length, 2);
  assert.equal(node?.mainEntity[0].name, 'Hotline ở đâu?');
  assert.equal(node?.mainEntity[0].acceptedAnswer.text, 'Gọi phòng kinh doanh.');
});

test('buildFaqPageNode filters empty items and deduplicates questions', () => {
  const node = buildFaqPageNode(CANONICAL, [
    { question: 'Câu hỏi', answer: 'Trả lời 1' },
    { question: 'câu hỏi', answer: 'Trả lời 2' },
    { question: '', answer: 'Không hợp lệ' },
    { question: 'Thiếu trả lời', answer: '' },
  ]) as FaqNode;

  assert.equal(node?.mainEntity.length, 1);
  assert.equal(node?.mainEntity[0].acceptedAnswer.text, 'Trả lời 1');
});

test('buildFaqPageNode returns null when no valid visible FAQ exists', () => {
  assert.equal(buildFaqPageNode(CANONICAL, []), null);
  assert.equal(buildFaqPageNode(CANONICAL, [{ question: '   ', answer: '   ' }]), null);
});

test('buildFaqPageNode does not mutate input data', () => {
  const items = [{ question: '  Q  ', answer: '  A  ' }];

  buildFaqPageNode(CANONICAL, items);

  assert.deepEqual(items, [{ question: '  Q  ', answer: '  A  ' }]);
});
