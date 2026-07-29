import assert from 'node:assert/strict';
import fs from 'node:fs';

const read = (file) => fs.readFileSync(new URL(`../${file}`, import.meta.url), 'utf8');

const adminPage = read('src/app/admin/du-an/page.tsx');
const taxonomyHelper = read('src/lib/projectTaxonomy.ts');
const controller = read('backend/app/Http/Controllers/Api/ProjectController.php');

assert.match(adminPage, /setFormCategoryIds\(getProjectTypeCategoryIds\(project\.categories\)\)/);
assert.match(adminPage, /normalizeProjectTypeCategoryIds\(formCategoryIds, categoriesData\)/);
assert.match(adminPage, /category_ids:\s*categoryIds/);
assert.match(taxonomyHelper, /category\.taxonomy_type === PROJECT_TYPE_TAXONOMY/);
assert.match(controller, /private function projectTypeCategoryIds\(array \$categoryIds\): array/);
assert.match(controller, /\.\.\.\$projectTypeCategoryIds/);

for (const field of [
  'location_description',
  'amenities_description',
  'floor_plan_description',
  'handover_description',
  'pricing_policy_description',
]) {
  assert.match(adminPage, new RegExp(`${field}:\\s*form[A-Za-z]+Description \\|\\| null`));
  assert.match(controller, new RegExp(`'${field}' => 'nullable\\|string'`));
}

console.log('Project admin save payload regression checks passed.');
