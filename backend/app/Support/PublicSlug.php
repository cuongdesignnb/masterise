<?php

namespace App\Support;

use App\Models\Post;
use App\Models\Project;
use Closure;
use Illuminate\Support\Str;

class PublicSlug
{
    /**
     * Top-level Next.js routes and well-known public files that cannot be
     * shadowed by the new /{slug} detail route.
     */
    private const RESERVED = [
        '_next', 'admin', 'ai-summary', 'api', 'chuyen-trang', 'dang-ky',
        'dang-nhap', 'dau-tu', 'du-an', 'favicon.ico', 'gioi-thieu',
        'lien-he', 'llms.txt', 'manifest.webmanifest', 'robots.txt',
        'sitemap.xml', 'tai-khoan', 'tin-tuc', 'tuyen-dung',
    ];

    public static function normalize(?string $value, string $fallback = 'noi-dung'): string
    {
        $slug = Str::slug(trim((string) $value)) ?: $fallback;

        return rtrim(mb_substr($slug, 0, 240), '-') ?: $fallback;
    }

    public static function unique(string $value, ?string $ignoreType = null, ?int $ignoreId = null): string
    {
        $base = self::normalize($value);
        $candidate = $base;
        $suffix = 2;

        while (! self::available($candidate, $ignoreType, $ignoreId)) {
            $candidate = $base.'-'.$suffix;
            $suffix++;
        }

        return $candidate;
    }

    public static function rule(?string $ignoreType = null, ?int $ignoreId = null): Closure
    {
        return function (string $attribute, mixed $value, Closure $fail) use ($ignoreType, $ignoreId): void {
            $slug = self::normalize((string) $value);

            if (! self::available($slug, $ignoreType, $ignoreId)) {
                $fail('Đường dẫn này đã được sử dụng hoặc trùng với đường dẫn hệ thống. Vui lòng chọn slug khác.');
            }
        };
    }

    public static function available(string $slug, ?string $ignoreType = null, ?int $ignoreId = null): bool
    {
        $slug = self::normalize($slug);

        if (in_array($slug, self::RESERVED, true)) {
            return false;
        }

        $projectExists = Project::query()
            ->where('slug', $slug)
            ->when($ignoreType === 'project' && $ignoreId, fn ($query) => $query->whereKeyNot($ignoreId))
            ->exists();

        if ($projectExists) {
            return false;
        }

        return ! Post::query()
            ->where('slug', $slug)
            ->when($ignoreType === 'post' && $ignoreId, fn ($query) => $query->whereKeyNot($ignoreId))
            ->exists();
    }
}
