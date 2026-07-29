import type { ProjectCategory } from '@/types/api';

export const PROJECT_TYPE_TAXONOMY = 'project_type' as const;

export function getProjectTypeCategoryIds(
  categories: ProjectCategory[] | null | undefined,
): number[] {
  if (!categories?.length) return [];

  return Array.from(new Set(
    categories
      .filter((category) => category.taxonomy_type === PROJECT_TYPE_TAXONOMY)
      .map((category) => Number(category.id))
      .filter(Number.isInteger),
  ));
}

export function normalizeProjectTypeCategoryIds(
  categoryIds: number[],
  availableCategories?: ProjectCategory[],
): number[] {
  const uniqueIds = Array.from(new Set(
    categoryIds
      .map(Number)
      .filter(Number.isInteger),
  ));

  if (!availableCategories) return uniqueIds;

  const allowedIds = new Set(getProjectTypeCategoryIds(availableCategories));
  return uniqueIds.filter((id) => allowedIds.has(id));
}
