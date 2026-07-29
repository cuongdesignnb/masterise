import assert from 'node:assert/strict';
import fs from 'node:fs';

const read = (path) => fs.readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');
const section = read('src/components/project-detail/ProjectPricingPolicySection.tsx');
const helper = read('src/lib/projectPricingPolicy.ts');
const admin = read('src/components/admin/ProjectPricingPolicyAdminEditor.tsx');
const richEditor = read('src/components/admin/RichTextEditor.tsx');
const media = read('src/components/admin/MediaSelectModal.tsx');
const rich = read('src/components/content/RichHtmlContent.tsx');
const css = read('src/app/globals.css');

assert.match(section, /buildLegacyPricingPolicyHtml/);
assert.match(section, /ResizeObserver/);
assert.match(section, /aria-modal="true"/);
assert.match(section, /ProjectSectionTitle/);
assert.match(helper, /headings\.length < 5/);
assert.match(helper, /new Set<string>/);
assert.match(helper, /derivePricingPolicyLegacyGallery/);
assert.match(helper, /explicitUrls/);
assert.match(helper, /return derivePricingPolicyExplicitGallery\(priceRows\)/);
assert.match(admin, /Nội dung bảng giá &amp; chính sách/);
assert.match(admin, /Ảnh bảng giá &amp; chính sách/);
assert.match(admin, /Trường giá hệ thống/);
assert.match(admin, /Dữ liệu gốc vẫn được giữ nguyên/);
assert.match(admin, /Đưa ảnh cũ vào gallery/);
assert.match(admin, /Ảnh chưa mất/);
assert.match(admin, /không còn tự động hiển thị ngoài client/);
assert.match(richEditor, /articleFileLink/);
assert.match(richEditor, /Chèn tài liệu/);
assert.match(media, /kind\?: 'image' \| 'document' \| 'all'/);
assert.match(rich, /rich-html-table-cue/);
assert.match(css, /\.pricing-policy-rich-content a\.article-file-link/);
assert.doesNotMatch(section, /Ảnh, file và dòng giá được lấy từ dữ liệu admin/);

console.log('project pricing policy static checks passed');
