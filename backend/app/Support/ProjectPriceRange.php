<?php

namespace App\Support;

use Illuminate\Database\Eloquent\Builder;

final class ProjectPriceRange
{
    public const UNDER_5 = 'under-5';
    public const FROM_5_TO_10 = '5-10';
    public const FROM_10_TO_20 = '10-20';
    public const FROM_20_TO_50 = '20-50';
    public const ABOVE_50 = 'above-50';

    private const FIVE_BILLION = 5_000_000_000;
    private const TEN_BILLION = 10_000_000_000;
    private const TWENTY_BILLION = 20_000_000_000;
    private const FIFTY_BILLION = 50_000_000_000;

    public static function values(): array
    {
        return [
            self::UNDER_5,
            self::FROM_5_TO_10,
            self::FROM_10_TO_20,
            self::FROM_20_TO_50,
            self::ABOVE_50,
        ];
    }

    public static function apply(Builder $query, string $range): Builder
    {
        return match ($range) {
            self::UNDER_5 => $query->whereNotNull('price_min')
                ->where('price_min', '<', self::FIVE_BILLION),
            self::FROM_5_TO_10 => $query->where('price_min', '>=', self::FIVE_BILLION)
                ->where('price_min', '<', self::TEN_BILLION),
            self::FROM_10_TO_20 => $query->where('price_min', '>=', self::TEN_BILLION)
                ->where('price_min', '<', self::TWENTY_BILLION),
            self::FROM_20_TO_50 => $query->where('price_min', '>=', self::TWENTY_BILLION)
                ->where('price_min', '<', self::FIFTY_BILLION),
            self::ABOVE_50 => $query->where('price_min', '>=', self::FIFTY_BILLION),
        };
    }

    public static function displayText(int|float|string|null $price): string
    {
        if ($price === null || !is_numeric($price)) {
            return 'Liên hệ';
        }

        $billions = (float) $price / 1_000_000_000;
        $formatted = rtrim(rtrim(number_format($billions, 2, ',', '.'), '0'), ',');

        return "Từ {$formatted} tỷ";
    }
}
