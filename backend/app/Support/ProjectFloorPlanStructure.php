<?php

namespace App\Support;

use Illuminate\Support\Str;

class ProjectFloorPlanStructure
{
    public static function normalize(mixed $value): array
    {
        $groups = self::arrayValue($value);
        $usedGroupKeys = [];

        return collect($groups)
            ->filter(fn ($group) => is_array($group) || is_object($group))
            ->values()
            ->map(function ($group, int $groupIndex) use (&$usedGroupKeys) {
                $group = (array) $group;
                $label = self::text($group['label'] ?? $group['name'] ?? 'Mặt bằng');
                $groupKey = self::uniqueKey(
                    self::text($group['key'] ?? ''),
                    $label ?: 'mat-bang',
                    $groupIndex,
                    $usedGroupKeys
                );
                $usedTabKeys = [];
                $tabs = collect(self::arrayValue($group['tabs'] ?? []))
                    ->filter(fn ($tab) => is_array($tab) || is_object($tab))
                    ->values()
                    ->map(function ($tab, int $tabIndex) use (&$usedTabKeys, $groupKey) {
                        $tab = (array) $tab;
                        $label = self::text($tab['label'] ?? $tab['name'] ?? 'Sản phẩm');
                        $tabKey = self::uniqueKey(
                            self::text($tab['key'] ?? ''),
                            $label ?: 'san-pham',
                            $tabIndex,
                            $usedTabKeys
                        );
                        $usedItemKeys = [];
                        $items = collect(self::arrayValue($tab['items'] ?? []))
                            ->filter(fn ($item) => is_array($item) || is_object($item))
                            ->values()
                            ->map(fn ($item, int $itemIndex) => self::normalizeItem(
                                (array) $item,
                                $itemIndex,
                                $usedItemKeys,
                                $groupKey.'-'.$tabKey
                            ))
                            ->all();

                        return [
                            'key' => $tabKey,
                            'label' => $label ?: 'Sản phẩm',
                            'items' => $items,
                        ];
                    })
                    ->all();

                return [
                    'key' => $groupKey,
                    'label' => $label ?: 'Mặt bằng',
                    'tabs' => $tabs,
                ];
            })
            ->all();
    }

    public static function fromLegacy(mixed $floorTabs, mixed $floorPlans): array
    {
        $tabs = collect(self::arrayValue($floorTabs))
            ->map(fn ($tab) => self::text(is_array($tab) ? ($tab['label'] ?? $tab['name'] ?? '') : $tab))
            ->filter()
            ->unique()
            ->values();
        $plans = collect(self::arrayValue($floorPlans))
            ->filter(fn ($plan) => is_array($plan) || is_object($plan))
            ->map(fn ($plan) => (array) $plan)
            ->values();

        foreach ($plans as $plan) {
            $tab = self::text($plan['productType'] ?? $plan['product_type'] ?? $plan['type'] ?? '');
            if ($tab !== '' && !$tabs->contains($tab)) {
                $tabs->push($tab);
            }
        }

        if ($plans->contains(fn ($plan) => self::text($plan['productType'] ?? $plan['product_type'] ?? $plan['type'] ?? '') === '')) {
            $tabs->push('Sản phẩm');
        }

        if ($tabs->isEmpty() && $plans->isNotEmpty()) {
            $tabs->push('Sản phẩm');
        }

        $legacyItemIndex = 0;
        $group = [
            'key' => 'mat-bang',
            'label' => 'Mặt bằng',
            'tabs' => $tabs->unique()->values()->map(function (string $tab) use ($plans, &$legacyItemIndex) {
                $items = $plans
                    ->filter(function (array $plan) use ($tab) {
                        $productType = self::text($plan['productType'] ?? $plan['product_type'] ?? $plan['type'] ?? '');
                        return $productType === $tab || ($tab === 'Sản phẩm' && $productType === '');
                    })
                    ->map(function (array $plan) use (&$legacyItemIndex) {
                        $legacyItemIndex++;
                        $plan['key'] = self::text($plan['key'] ?? '') ?: 'legacy-item-'.$legacyItemIndex;
                        return $plan;
                    })
                    ->values()
                    ->all();

                return [
                    'key' => Str::slug($tab) ?: 'san-pham',
                    'label' => $tab,
                    'items' => $items,
                ];
            })->all(),
        ];

        return self::normalize([$group]);
    }

    public static function flatten(mixed $groups): array
    {
        $normalized = self::normalize($groups);
        $tabs = [];
        $plans = [];

        foreach ($normalized as $group) {
            foreach ($group['tabs'] as $tab) {
                $legacyTab = trim($group['label'].' / '.$tab['label'], " /\t\n\r\0\x0B");
                $tabs[] = $legacyTab;

                foreach ($tab['items'] as $item) {
                    $images = self::images($item);
                    $plans[] = [
                        'key' => $item['key'],
                        'productType' => $legacyTab,
                        'name' => $item['name'],
                        'area' => $item['area'],
                        'totalArea' => $item['totalArea'],
                        'description' => $item['description'],
                        'price' => $item['price'],
                        'bedrooms' => $item['bedrooms'],
                        'status' => $item['status'],
                        'image' => $images[0] ?? '',
                        'images' => $images,
                    ];
                }
            }
        }

        return [
            'floor_tabs' => array_values(array_unique($tabs)),
            'floor_plans' => $plans,
        ];
    }

    private static function normalizeItem(array $item, int $index, array &$usedKeys, string $prefix): array
    {
        $name = self::text($item['name'] ?? $item['title'] ?? $item['label'] ?? '');
        $key = self::uniqueKey(
            self::text($item['key'] ?? ''),
            $name ?: $prefix.'-item',
            $index,
            $usedKeys
        );

        return [
            'key' => $key,
            'productType' => self::text($item['productType'] ?? $item['product_type'] ?? $item['type'] ?? ''),
            'name' => $name,
            'area' => self::text($item['area'] ?? $item['area_text'] ?? $item['size'] ?? ''),
            'totalArea' => self::text($item['totalArea'] ?? $item['total_area'] ?? ''),
            'description' => self::text($item['description'] ?? $item['desc'] ?? ''),
            'price' => self::text($item['price'] ?? $item['price_text'] ?? ''),
            'bedrooms' => self::text($item['bedrooms'] ?? $item['bedroom'] ?? ''),
            'status' => self::text($item['status'] ?? ''),
            'images' => self::images($item),
        ];
    }

    private static function images(array $item): array
    {
        $values = [];
        foreach (['image', 'image_url', 'thumbnail', 'url', 'src'] as $field) {
            $values[] = self::text($item[$field] ?? '');
        }
        foreach (['images', 'image_urls', 'gallery', 'photos'] as $field) {
            foreach (self::arrayValue($item[$field] ?? []) as $image) {
                $values[] = self::text($image);
            }
        }

        return collect($values)->filter()->unique()->values()->all();
    }

    private static function uniqueKey(string $preferred, string $fallback, int $index, array &$used): string
    {
        $base = Str::slug($preferred) ?: Str::slug($fallback) ?: 'item-'.($index + 1);
        $key = $base;
        $suffix = 2;
        while (isset($used[$key])) {
            $key = $base.'-'.$suffix;
            $suffix++;
        }
        $used[$key] = true;
        return $key;
    }

    private static function arrayValue(mixed $value): array
    {
        if (is_string($value)) {
            $decoded = json_decode($value, true);
            return is_array($decoded) ? $decoded : [];
        }

        return is_array($value) ? $value : [];
    }

    private static function text(mixed $value): string
    {
        return is_scalar($value) ? trim((string) $value) : '';
    }
}
