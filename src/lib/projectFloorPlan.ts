import type { FloorPlanGroup, FloorPlanItem, LegacyFloorPlanItem } from '@/types/floor-plan';

const records = (value: unknown): Record<string, unknown>[] =>
  Array.isArray(value)
    ? value.filter((item): item is Record<string, unknown> => Boolean(item) && typeof item === 'object' && !Array.isArray(item))
    : [];

const text = (value: unknown) => typeof value === 'string' || typeof value === 'number' ? String(value).trim() : '';

const strings = (value: unknown): string[] => Array.isArray(value)
  ? value.map(text).filter(Boolean)
  : text(value) ? [text(value)] : [];

export const uniqueFloorPlanImages = (...values: unknown[]): string[] =>
  Array.from(new Set(values.flatMap(strings).filter(Boolean)));

export const floorPlanKey = (value: string, fallback: string): string => {
  const normalized = value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[đĐ]/g, 'd')
    .replace(/[^a-z0-9_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return normalized || fallback;
};

const uniqueKey = (preferred: string, fallback: string, used: Set<string>) => {
  const base = floorPlanKey(preferred, fallback);
  let key = base;
  let suffix = 2;
  while (used.has(key)) key = `${base}-${suffix++}`;
  used.add(key);
  return key;
};

export const normalizeFloorPlanItem = (
  value: Record<string, unknown>,
  index: number,
  usedKeys = new Set<string>(),
  prefix = 'floor-plan',
): FloorPlanItem => {
  const name = text(value.name || value.title || value.label);
  const images = uniqueFloorPlanImages(
    value.image,
    value.image_url,
    value.thumbnail,
    value.url,
    value.src,
    value.images,
    value.image_urls,
    value.gallery,
    value.photos,
  );
  return {
    key: uniqueKey(text(value.key), floorPlanKey(name, `${prefix}-item-${index + 1}`), usedKeys),
    productType: text(value.productType || value.product_type || value.type),
    name,
    area: text(value.area || value.area_text || value.size),
    totalArea: text(value.totalArea || value.total_area),
    description: text(value.description || value.desc || value.note),
    price: text(value.price || value.price_text),
    bedrooms: text(value.bedrooms || value.bedroom),
    status: text(value.status),
    images,
  };
};

export const normalizeFloorPlanGroups = (
  canonical: unknown,
  legacyTabs: unknown = [],
  legacyPlans: unknown = [],
): FloorPlanGroup[] => {
  if (!Array.isArray(canonical)) return floorPlanGroupsFromLegacy(legacyTabs, legacyPlans);

  const usedGroupKeys = new Set<string>();
  return records(canonical).map((group, groupIndex) => {
    const label = text(group.label || group.name) || 'Mặt bằng';
    const key = uniqueKey(text(group.key), floorPlanKey(label, `floor-group-${groupIndex + 1}`), usedGroupKeys);
    const usedTabKeys = new Set<string>();
    const tabs = records(group.tabs).map((tab, tabIndex) => {
      const tabLabel = text(tab.label || tab.name) || 'Sản phẩm';
      const tabKey = uniqueKey(text(tab.key), floorPlanKey(tabLabel, `floor-tab-${tabIndex + 1}`), usedTabKeys);
      const usedItemKeys = new Set<string>();
      return {
        key: tabKey,
        label: tabLabel,
        items: records(tab.items).map((item, itemIndex) => normalizeFloorPlanItem(item, itemIndex, usedItemKeys, `${key}-${tabKey}`)),
      };
    });
    return { key, label, tabs };
  });
};

export const floorPlanGroupsFromLegacy = (legacyTabs: unknown, legacyPlans: unknown): FloorPlanGroup[] => {
  const plans = records(legacyPlans);
  const tabs = Array.from(new Set([
    ...strings(legacyTabs),
    ...plans.map((item) => text(item.productType || item.product_type || item.type)).filter(Boolean),
  ]));
  if (plans.some((item) => !text(item.productType || item.product_type || item.type))) tabs.push('Sản phẩm');
  if (!tabs.length && plans.length) tabs.push('Sản phẩm');
  if (!tabs.length) return [];

  const usedTabKeys = new Set<string>();
  let legacyIndex = 0;
  return [{
    key: 'mat-bang',
    label: 'Mặt bằng',
    tabs: Array.from(new Set(tabs)).map((label, tabIndex) => {
      const tabKey = uniqueKey('', floorPlanKey(label, `floor-tab-${tabIndex + 1}`), usedTabKeys);
      const usedItemKeys = new Set<string>();
      const items = plans
        .filter((item) => {
          const productType = text(item.productType || item.product_type || item.type);
          return productType === label || (label === 'Sản phẩm' && !productType);
        })
        .map((item) => normalizeFloorPlanItem(item, legacyIndex++, usedItemKeys, `legacy-${tabKey}`));
      return { key: tabKey, label, items };
    }),
  }];
};

export const flattenFloorPlanGroups = (groups: FloorPlanGroup[]): { floorTabs: string[]; floorPlans: LegacyFloorPlanItem[] } => {
  const floorTabs: string[] = [];
  const floorPlans: LegacyFloorPlanItem[] = [];
  groups.forEach((group) => group.tabs.forEach((tab) => {
    const productType = `${group.label} / ${tab.label}`;
    floorTabs.push(productType);
    tab.items.forEach((item) => floorPlans.push({
      ...item,
      productType,
      image: item.images[0] || '',
      images: item.images,
    }));
  }));
  return { floorTabs: Array.from(new Set(floorTabs)), floorPlans };
};

export const createFloorPlanKey = (prefix: 'group' | 'tab' | 'item') => {
  const uuid = typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  return `${prefix}-${uuid}`;
};
