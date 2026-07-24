import assert from "node:assert/strict";
import fs from "node:fs";

const read = (path) => fs.readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
const detail = read("src/components/project-detail/ProjectDetailClient.tsx");
const pricing = read("src/components/project-detail/ProjectPricingPolicySection.tsx");
const gallery = read("src/components/project-detail/ProjectGalleryAlbumSection.tsx");
const reviews = read("src/components/project-detail/ProjectReviews.tsx");
const rich = read("src/components/content/RichHtmlContent.tsx");
const css = read("src/app/globals.css");

assert.equal((detail.match(/<h1\b/g) || []).length, 0, "project detail must use the shared page title component");
assert.equal((detail.match(/<ProjectPageTitle\b/g) || []).length, 1, "project detail must render one shared H1");
assert.equal((detail.match(/<h2\b/g) || []).length, 0, "project detail must not contain raw H2 markup");
assert.match(detail, /<RichHtmlContent\s+variant="project"/);
for (const source of [detail, pricing, gallery, reviews]) {
  assert.match(source, /ProjectSectionTitle/, "all major project sections use the shared H2 component");
}
assert.match(rich, /variant\?: "default" \| "project"/);
assert.match(rich, /normalizeProjectHeadings/);
assert.match(css, /\.project-display-title/);
assert.match(css, /\.project-section-title/);
assert.match(css, /\.project-rich-content \.ql-size-huge \{ font-size: 1\.25em; \}/);

console.log("project typography static checks passed");
