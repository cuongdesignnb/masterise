import assert from 'node:assert/strict';
import fs from 'node:fs';

const read = (path) => fs.readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');
const detail = read('src/components/project-detail/ProjectDetailClient.tsx');
const timeline = read('src/components/project-detail/ProjectTimelineGallerySection.tsx');
const gallery = read('src/components/project-detail/ProjectImageGallery.tsx');
const album = read('src/components/project-detail/ProjectGalleryAlbumSection.tsx');
const helper = read('src/lib/projectTimeline.ts');
const adapter = read('src/adapters/projectAdapter.ts');
const admin = read('src/components/admin/ProjectTimelineAdminEditor.tsx');
const adminPage = read('src/app/admin/du-an/page.tsx');

assert.match(detail, /ProjectTimelineGallerySection/);
assert.doesNotMatch(detail, /md:grid-cols-5/);
assert.doesNotMatch(timeline, /Nhận cập nhật tiến độ mới nhất|Đăng ký nhận cập nhật/);
assert.match(timeline, /role="tablist"/);
assert.match(timeline, /role="tab"/);
assert.match(timeline, /aria-selected=/);
assert.match(gallery, /activeImageIndex !== null/);
assert.match(gallery, /event\.key === "Escape"/);
assert.match(gallery, /event\.key === "ArrowLeft"/);
assert.match(gallery, /event\.key === "ArrowRight"/);
assert.match(gallery, /openerRef\.current\?\.focus/);
assert.match(album, /ProjectImageGallery/);
assert.match(timeline, /ProjectImageGallery/);
assert.match(helper, /record\.image_url/);
assert.match(helper, /record\.imageUrl/);
assert.match(helper, /record\.gallery/);
assert.match(helper, /record\.image_urls/);
assert.match(adapter, /normalizeProjectTimeline\(api\.project_timeline\)/);
assert.match(admin, /Thêm mốc tiến độ/);
assert.match(admin, /Chọn nhiều ảnh/);
assert.match(adminPage, /description: item\.description\.trim\(\)/);
assert.match(adminPage, /bullets: item\.bullets/);
assert.match(adminPage, /images: uniqueProjectTimelineImages/);
assert.match(adminPage, /key: item\.key/);

console.log('project timeline gallery static checks passed');
