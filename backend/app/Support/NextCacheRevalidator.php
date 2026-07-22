<?php

namespace App\Support;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

final class NextCacheRevalidator
{
    public static function tags(array $tags): void
    {
        $url = config('services.next_revalidation.url');
        $secret = config('services.next_revalidation.secret');
        if (!$url || !$secret) return;

        try {
            Http::timeout(3)
                ->acceptJson()
                ->withToken($secret)
                ->post($url, ['tags' => array_values(array_unique($tags))])
                ->throw();
        } catch (\Throwable $exception) {
            Log::warning('Next.js cache revalidation failed.', [
                'tags' => $tags,
                'error' => $exception->getMessage(),
            ]);
        }
    }
}
