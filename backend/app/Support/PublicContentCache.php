<?php

namespace App\Support;

use Illuminate\Support\Facades\Cache;

final class PublicContentCache
{
    public static function remember(string $scope, array $parameters, int $ttlSeconds, callable $resolver): mixed
    {
        ksort($parameters);
        $version = (int) Cache::get(self::versionKey($scope), 1);
        $key = 'public-content:'.$scope.':v'.$version.':'.hash('sha256', json_encode($parameters));

        return Cache::remember($key, now()->addSeconds($ttlSeconds), $resolver);
    }

    public static function invalidate(string ...$scopes): void
    {
        foreach (array_unique($scopes) as $scope) {
            $key = self::versionKey($scope);
            Cache::forever($key, (int) Cache::get($key, 1) + 1);
        }
    }

    private static function versionKey(string $scope): string
    {
        return 'public-content-version:'.$scope;
    }
}
