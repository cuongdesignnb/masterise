<?php

namespace App\Support;

final class ProjectStatus
{
    public const COMING_SOON = 'coming_soon';
    public const SELLING = 'selling';
    public const SOLD_OUT = 'sold_out';
    public const HANDING_OVER = 'handing_over';
    public const HANDOVER = 'handover';

    public static function values(): array
    {
        return [
            self::COMING_SOON,
            self::SELLING,
            self::SOLD_OUT,
            self::HANDING_OVER,
            self::HANDOVER,
        ];
    }

    public static function fromLegacy(?string $salesStatus, ?string $status): ?string
    {
        return self::fromLegacySalesStatus($salesStatus)
            ?? self::fromLegacyStatus($status);
    }

    public static function fromLegacySalesStatus(?string $value): ?string
    {
        return match (self::clean($value)) {
            self::COMING_SOON, 'upcoming' => self::COMING_SOON,
            self::SELLING => self::SELLING,
            self::SOLD_OUT, 'sold', 'out_of_stock' => self::SOLD_OUT,
            self::HANDING_OVER => self::HANDING_OVER,
            self::HANDOVER, 'handed_over', 'completed' => self::HANDOVER,
            default => null,
        };
    }

    public static function fromLegacyStatus(?string $value): ?string
    {
        return match (self::clean($value)) {
            'upcoming' => self::COMING_SOON,
            self::SELLING => self::SELLING,
            'completed' => self::HANDOVER,
            default => null,
        };
    }

    private static function clean(?string $value): string
    {
        return strtolower(trim((string) $value));
    }
}
