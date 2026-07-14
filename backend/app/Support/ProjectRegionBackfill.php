<?php

namespace App\Support;

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use RuntimeException;

final class ProjectRegionBackfill
{
    public static function run(): array
    {
        return DB::transaction(function () {
            self::ensureDefaultRegions();

            $regions = DB::table('regions')->get(['id', 'name', 'slug']);
            $unresolved = [];
            $createdLocations = 0;
            $assignedProjects = 0;

            DB::table('projects')->orderBy('id')->each(function ($project) use ($regions, &$unresolved, &$createdLocations, &$assignedProjects) {
                $location = $project->location_id
                    ? DB::table('locations')->where('id', $project->location_id)->first()
                    : null;
                $regionId = $location?->region_id ?: self::resolveRegionId($project, $regions);

                if (!$regionId) {
                    if ($project->is_published) {
                        $unresolved[] = [
                            'id' => (int) $project->id,
                            'name' => $project->name,
                            'region' => $project->region,
                            'province' => $project->province,
                            'location' => $project->location,
                            'address' => $project->address,
                        ];
                    }
                    return;
                }

                $region = $regions->firstWhere('id', $regionId);
                if (!$location) {
                    [$location, $created] = self::findOrCreateLocation($project, $region);
                    $createdLocations += $created ? 1 : 0;
                } elseif (!$location->region_id) {
                    DB::table('locations')->where('id', $location->id)->update([
                        'region_id' => $regionId,
                        'updated_at' => now(),
                    ]);
                } elseif ((int) $location->region_id !== (int) $regionId) {
                    $unresolved[] = [
                        'id' => (int) $project->id,
                        'name' => $project->name,
                        'reason' => 'Location hiện tại thuộc vùng khác với dữ liệu dự án.',
                    ];
                    return;
                }

                DB::table('projects')->where('id', $project->id)->update([
                    'location_id' => $location->id,
                    'region' => $region->name,
                    'updated_at' => now(),
                ]);
                $assignedProjects++;
            });

            $publishedWithoutLocation = DB::table('projects')
                ->where('is_published', true)
                ->whereNull('location_id')
                ->pluck('id');
            $publishedWithoutRegion = DB::table('projects')
                ->join('locations', 'locations.id', '=', 'projects.location_id')
                ->where('projects.is_published', true)
                ->whereNull('locations.region_id')
                ->pluck('projects.id');

            if ($unresolved || $publishedWithoutLocation->isNotEmpty() || $publishedWithoutRegion->isNotEmpty()) {
                Log::error('Project region backfill could not resolve all published projects.', [
                    'unresolved' => $unresolved,
                    'published_without_location' => $publishedWithoutLocation->all(),
                    'published_location_without_region' => $publishedWithoutRegion->all(),
                ]);
                throw new RuntimeException('Project region backfill stopped. Unresolved published project IDs: '.collect($unresolved)->pluck('id')->merge($publishedWithoutLocation)->merge($publishedWithoutRegion)->unique()->implode(', '));
            }

            $result = [
                'projects_assigned' => $assignedProjects,
                'locations_created' => $createdLocations,
                'published_without_location' => 0,
                'published_location_without_region' => 0,
            ];
            Log::info('Project region backfill completed.', $result);

            return $result;
        });
    }

    private static function ensureDefaultRegions(): void
    {
        $defaults = [
            ['name' => 'Miền Bắc', 'slug' => 'mien-bac', 'sort_order' => 10],
            ['name' => 'Miền Trung', 'slug' => 'mien-trung', 'sort_order' => 20],
            ['name' => 'Miền Nam', 'slug' => 'mien-nam', 'sort_order' => 30],
            ['name' => 'Quốc tế', 'slug' => 'quoc-te', 'sort_order' => 40],
        ];

        foreach ($defaults as $region) {
            if (!DB::table('regions')->where('slug', $region['slug'])->exists()) {
                DB::table('regions')->insert([
                    ...$region,
                    'description' => null,
                    'is_active' => true,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }
        }
    }

    private static function resolveRegionId(object $project, $regions): ?int
    {
        $text = self::normalize(implode(' ', array_filter([
            $project->province,
            $project->region,
            $project->address,
            $project->location,
            $project->district,
            $project->ward,
        ])));

        foreach ($regions as $region) {
            $name = self::normalize($region->name);
            $slug = self::normalize($region->slug);
            if (($name && str_contains($text, $name)) || ($slug && str_contains($text, $slug))) {
                return (int) $region->id;
            }
        }

        $regionalPlaces = [
            'mien-bac' => ['ha noi', 'hai phong', 'quang ninh', 'bac ninh', 'hung yen', 'gia lam', 'tay ho'],
            'mien-trung' => ['da nang', 'hue', 'quang nam', 'quang ngai', 'binh dinh', 'khanh hoa', 'nha trang', 'lam dong'],
            'mien-nam' => ['ho chi minh', 'tp hcm', 'sai gon', 'thu duc', 'quan 1', 'binh duong', 'dong nai', 'can tho', 'vung tau'],
            'quoc-te' => ['quoc te', 'international'],
        ];

        foreach ($regionalPlaces as $regionSlug => $needles) {
            if (collect($needles)->contains(fn ($needle) => str_contains($text, $needle))) {
                return (int) optional($regions->firstWhere('slug', $regionSlug))->id;
            }
        }

        return null;
    }

    private static function findOrCreateLocation(object $project, object $region): array
    {
        $name = trim((string) ($project->location ?: $project->address ?: $project->name));
        $baseSlug = Str::slug($name) ?: 'du-an-'.$project->id;
        $location = DB::table('locations')->where('slug', $baseSlug)->first();

        if ($location && $location->region_id && (int) $location->region_id !== (int) $region->id) {
            $baseSlug .= '-'.$region->slug;
            $location = DB::table('locations')->where('slug', $baseSlug)->first();
        }

        if ($location) {
            if (!$location->region_id) {
                DB::table('locations')->where('id', $location->id)->update([
                    'region_id' => $region->id,
                    'updated_at' => now(),
                ]);
                $location->region_id = $region->id;
            }
            return [$location, false];
        }

        $slug = $baseSlug;
        $suffix = 2;
        while (DB::table('locations')->where('slug', $slug)->exists()) {
            $slug = $baseSlug.'-'.$suffix++;
        }

        $id = DB::table('locations')->insertGetId([
            'region_id' => $region->id,
            'name' => Str::limit($name, 255, ''),
            'slug' => $slug,
            'province' => $project->province,
            'district' => $project->district,
            'ward' => $project->ward,
            'address' => $project->address,
            'latitude' => $project->lat,
            'longitude' => $project->lng,
            'description' => 'Được tạo tự động khi chuẩn hóa vị trí dự án.',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        return [DB::table('locations')->where('id', $id)->first(), true];
    }

    private static function normalize(?string $value): string
    {
        $ascii = Str::ascii(Str::lower(trim((string) $value)));
        $ascii = preg_replace('/[^a-z0-9]+/', ' ', $ascii) ?? '';
        return trim(preg_replace('/\s+/', ' ', $ascii) ?? '');
    }
}
