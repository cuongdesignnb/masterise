import assert from 'node:assert/strict';
import fs from 'node:fs';

const detail = fs.readFileSync(new URL('../src/components/project-detail/ProjectDetailClient.tsx', import.meta.url), 'utf8');

assert.equal(detail.includes('Tóm tắt nhanh cho AI & người đọc'), false, 'AI-only visible label must be removed');
assert.equal((detail.match(/project-quick-summary-title/g) || []).length, 2, 'summary section and title id must occur once each');
assert.equal((detail.match(/quickAnswerItems\.map\(/g) || []).length, 1, 'quick answers render exactly once');
assert.equal((detail.match(/<section aria-labelledby="project-quick-summary-title">/g) || []).length, 1, 'summary keeps semantic labelled section');
assert.equal((detail.match(/<SharedProjectSectionTitle id="project-quick-summary-title"/g) || []).length, 1, 'summary keeps one semantic H2');

const summaryIndex = detail.indexOf('<section aria-labelledby="project-quick-summary-title">');
const faqIndex = detail.indexOf('sectionKey="faq"');
const galleryIndex = detail.indexOf('<ProjectGalleryAlbumSection project={project} />');
const vrIndex = detail.indexOf('<VR360Section');
const formIndex = detail.indexOf('id="project-consult-form"');
assert(summaryIndex > faqIndex, 'summary is after FAQ');
assert(summaryIndex > galleryIndex, 'summary is after gallery');
assert(summaryIndex > vrIndex, 'summary is after VR360 slot');
assert(summaryIndex < formIndex, 'summary is before consultation form');
assert.equal(detail.includes('buildFaqPageNode(quickAnswerItems'), false, 'quick answers are not used to fabricate FAQ schema');

console.log('project summary placement and schema boundary checks passed');
