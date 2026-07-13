<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

return new class extends Migration
{
    public function up(): void
    {
        $normalize = static function (?string $value): string {
            $value = mb_strtolower(trim((string) $value));
            $value = str_replace(['-', '_'], ' ', $value);
            return trim((string) preg_replace('/\s+/u', ' ', $value));
        };

        $canonical = [
            'miền bắc' => 'Miền Bắc', 'mien bac' => 'Miền Bắc',
            'miền trung' => 'Miền Trung', 'mien trung' => 'Miền Trung',
            'miền nam' => 'Miền Nam', 'mien nam' => 'Miền Nam',
            'quốc tế' => 'Quốc tế', 'quoc te' => 'Quốc tế',
        ];
        $cityAliases = [
            'hà nội' => 'Miền Bắc', 'thành phố hà nội' => 'Miền Bắc', 'ha noi' => 'Miền Bắc',
            'thành phố thủ đức' => 'Miền Nam', 'tp. thủ đức' => 'Miền Nam', 'tp thủ đức' => 'Miền Nam',
            'thủ đức' => 'Miền Nam', 'quận 1' => 'Miền Nam', 'quận1' => 'Miền Nam',
            'thành phố hồ chí minh' => 'Miền Nam', 'tp. hồ chí minh' => 'Miền Nam',
            'tp hồ chí minh' => 'Miền Nam', 'hồ chí minh' => 'Miền Nam', 'tp.hcm' => 'Miền Nam',
        ];
        $provinceGroups = [
            'Miền Bắc' => ['hà nội', 'hải phòng', 'quảng ninh', 'bắc giang', 'bắc ninh', 'hà nam', 'hải dương', 'hưng yên', 'nam định', 'ninh bình', 'thái bình', 'vĩnh phúc', 'phú thọ', 'thái nguyên', 'tuyên quang', 'lào cai', 'yên bái', 'hà giang', 'cao bằng', 'bắc kạn', 'lạng sơn', 'điện biên', 'lai châu', 'sơn la', 'hòa bình'],
            'Miền Trung' => ['thanh hóa', 'nghệ an', 'hà tĩnh', 'quảng bình', 'quảng trị', 'thừa thiên huế', 'huế', 'đà nẵng', 'quảng nam', 'quảng ngãi', 'bình định', 'phú yên', 'khánh hòa', 'ninh thuận', 'bình thuận', 'kon tum', 'gia lai', 'đắk lắk', 'đắk nông', 'lâm đồng'],
            'Miền Nam' => ['hồ chí minh', 'thành phố hồ chí minh', 'bình phước', 'bình dương', 'đồng nai', 'tây ninh', 'bà rịa vũng tàu', 'long an', 'tiền giang', 'bến tre', 'trà vinh', 'vĩnh long', 'đồng tháp', 'an giang', 'kiên giang', 'cần thơ', 'hậu giang', 'sóc trăng', 'bạc liêu', 'cà mau'],
        ];
        $provinceMappings = [];
        foreach ($provinceGroups as $region => $provinces) {
            foreach ($provinces as $province) {
                $provinceMappings[$normalize($province)] = $region;
            }
        }

        $updated = 0;
        $resolvedFromRegion = 0;
        $resolvedFromProvince = 0;
        $unresolved = [];

        DB::table('projects')
            ->select('id', 'name', 'region', 'province', 'district', 'ward', 'location', 'address')
            ->orderBy('id')
            ->each(function ($project) use ($normalize, $canonical, $cityAliases, $provinceMappings, &$updated, &$resolvedFromRegion, &$resolvedFromProvince, &$unresolved) {
                $regionKey = $normalize($project->region);
                $resolved = $canonical[$regionKey] ?? $cityAliases[$regionKey] ?? null;

                if ($resolved !== null) {
                    $resolvedFromRegion++;
                } else {
                    $resolved = $provinceMappings[$normalize($project->province)] ?? null;
                    if ($resolved !== null) {
                        $resolvedFromProvince++;
                    }
                }

                if ($resolved === null) {
                    $unresolved[] = [
                        'id' => (int) $project->id,
                        'name' => $project->name,
                        'region' => $project->region,
                        'province' => $project->province,
                        'district' => $project->district,
                        'ward' => $project->ward,
                        'location' => $project->location,
                        'address' => $project->address,
                    ];
                }

                if ($resolved !== $project->region) {
                    DB::table('projects')->where('id', $project->id)->update(['region' => $resolved]);
                    $updated++;
                }
            });

        Log::info('Project regions enforced from region/province fields', [
            'updated_count' => $updated,
            'resolved_from_region_count' => $resolvedFromRegion,
            'resolved_from_province_count' => $resolvedFromProvince,
            'unresolved_count' => count($unresolved),
            'unresolved_projects' => $unresolved,
        ]);
    }

    public function down(): void
    {
        // Previous city labels cannot be reconstructed safely from a canonical region.
    }
};
