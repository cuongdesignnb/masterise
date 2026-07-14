<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

return new class extends Migration
{
    public function up(): void
    {
        $now = now();
        $defaults = [
            ['name' => 'Miền Bắc', 'slug' => 'mien-bac', 'sort_order' => 10],
            ['name' => 'Miền Trung', 'slug' => 'mien-trung', 'sort_order' => 20],
            ['name' => 'Miền Nam', 'slug' => 'mien-nam', 'sort_order' => 30],
            ['name' => 'Quốc tế', 'slug' => 'quoc-te', 'sort_order' => 40],
        ];

        foreach ($defaults as $region) {
            DB::table('regions')->updateOrInsert(
                ['slug' => $region['slug']],
                [...$region, 'is_active' => true, 'created_at' => $now, 'updated_at' => $now]
            );
        }

        $regionIds = DB::table('regions')->pluck('id', 'name');
        $normalize = static function (?string $value): string {
            $ascii = Str::ascii(Str::lower(trim((string) $value)));
            $ascii = preg_replace('/[^a-z0-9]+/', ' ', $ascii) ?? '';
            return trim(preg_replace('/\s+/', ' ', $ascii) ?? '');
        };

        $canonical = [
            'mien bac' => 'Miền Bắc',
            'bac' => 'Miền Bắc',
            'mien trung' => 'Miền Trung',
            'trung' => 'Miền Trung',
            'mien nam' => 'Miền Nam',
            'nam' => 'Miền Nam',
            'quoc te' => 'Quốc tế',
            'international' => 'Quốc tế',
        ];
        $legacyPlaces = [
            'ha noi' => 'Miền Bắc',
            'thanh pho ha noi' => 'Miền Bắc',
            'thanh pho ho chi minh' => 'Miền Nam',
            'tp ho chi minh' => 'Miền Nam',
            'tp hcm' => 'Miền Nam',
            'ho chi minh' => 'Miền Nam',
            'thanh pho thu duc' => 'Miền Nam',
            'tp thu duc' => 'Miền Nam',
            'thu duc' => 'Miền Nam',
            'quan 1' => 'Miền Nam',
        ];
        $provinceGroups = [
            'Miền Bắc' => ['Hà Nội', 'Hải Phòng', 'Quảng Ninh', 'Bắc Giang', 'Bắc Ninh', 'Hà Nam', 'Hải Dương', 'Hưng Yên', 'Nam Định', 'Ninh Bình', 'Thái Bình', 'Vĩnh Phúc', 'Phú Thọ', 'Thái Nguyên', 'Tuyên Quang', 'Lào Cai', 'Yên Bái', 'Hà Giang', 'Cao Bằng', 'Bắc Kạn', 'Lạng Sơn', 'Điện Biên', 'Lai Châu', 'Sơn La', 'Hòa Bình'],
            'Miền Trung' => ['Thanh Hóa', 'Nghệ An', 'Hà Tĩnh', 'Quảng Bình', 'Quảng Trị', 'Thừa Thiên Huế', 'Huế', 'Đà Nẵng', 'Quảng Nam', 'Quảng Ngãi', 'Bình Định', 'Phú Yên', 'Khánh Hòa', 'Ninh Thuận', 'Bình Thuận', 'Kon Tum', 'Gia Lai', 'Đắk Lắk', 'Đắk Nông', 'Lâm Đồng'],
            'Miền Nam' => ['Hồ Chí Minh', 'Bình Phước', 'Bình Dương', 'Đồng Nai', 'Tây Ninh', 'Bà Rịa Vũng Tàu', 'Long An', 'Tiền Giang', 'Bến Tre', 'Trà Vinh', 'Vĩnh Long', 'Đồng Tháp', 'An Giang', 'Kiên Giang', 'Cần Thơ', 'Hậu Giang', 'Sóc Trăng', 'Bạc Liêu', 'Cà Mau'],
        ];
        $provinceMap = [];
        foreach ($provinceGroups as $regionName => $provinces) {
            foreach ($provinces as $province) {
                $key = $normalize($province);
                $provinceMap[$key] = $regionName;
                $provinceMap["tinh {$key}"] = $regionName;
                $provinceMap["thanh pho {$key}"] = $regionName;
            }
        }

        $conflicts = [];
        $unresolvedLocations = [];
        $backfilled = 0;

        DB::table('locations')->orderBy('id')->each(function ($location) use (
            $canonical,
            $legacyPlaces,
            $normalize,
            $provinceMap,
            $regionIds,
            &$conflicts,
            &$unresolvedLocations,
            &$backfilled
        ) {
            $projectRegions = DB::table('projects')
                ->where('location_id', $location->id)
                ->pluck('region')
                ->map(function ($value) use ($canonical, $legacyPlaces, $normalize) {
                    $key = $normalize($value);
                    return $canonical[$key] ?? $legacyPlaces[$key] ?? null;
                })
                ->filter()
                ->unique()
                ->values();

            if ($projectRegions->count() > 1) {
                $conflicts[] = [
                    'location_id' => (int) $location->id,
                    'location_name' => $location->name,
                    'regions' => $projectRegions->all(),
                ];
                return;
            }

            $regionName = $projectRegions->first()
                ?? ($provinceMap[$normalize($location->province)] ?? null);

            if (!$regionName || !$regionIds->has($regionName)) {
                $unresolvedLocations[] = [
                    'location_id' => (int) $location->id,
                    'location_name' => $location->name,
                    'province' => $location->province,
                ];
                return;
            }

            DB::table('locations')->where('id', $location->id)->update([
                'region_id' => $regionIds[$regionName],
                'updated_at' => now(),
            ]);
            DB::table('projects')->where('location_id', $location->id)->update([
                'region' => $regionName,
                'updated_at' => now(),
            ]);
            $backfilled++;
        });

        $projectsWithoutLocation = DB::table('projects')
            ->whereNull('location_id')
            ->get(['id', 'name', 'province', 'district', 'region'])
            ->map(fn ($project) => (array) $project)
            ->all();

        Log::info('Dynamic regions backfill completed', [
            'default_regions_created' => count($defaults),
            'locations_backfilled' => $backfilled,
            'locations_unresolved' => $unresolvedLocations,
            'location_region_conflicts' => $conflicts,
            'projects_without_location' => $projectsWithoutLocation,
        ]);
    }

    public function down(): void
    {
        // Region assignments cannot be safely reconstructed after later admin edits.
    }
};
