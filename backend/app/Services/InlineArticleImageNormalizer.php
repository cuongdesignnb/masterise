<?php

namespace App\Services;

use InvalidArgumentException;

class InlineArticleImageNormalizer
{
    private const MAX_IMAGE_BYTES = 10 * 1024 * 1024;

    private const DATA_IMAGE_PATTERN = '~(<img\b[^>]*\bsrc\s*=\s*)(["\'])(data:image/(png|jpe?g|gif|webp);base64,([^"\']+))\2~i';

    public function __construct(private readonly MediaStorageService $mediaStorage) {}

    public function normalize(?string $html, ?int $uploadedBy = null, string $context = 'Nội dung bài viết'): ?string
    {
        if ($html === null || $html === '' || ! str_contains($html, 'data:image')) {
            return $html;
        }

        $index = 0;
        $normalized = preg_replace_callback(
            self::DATA_IMAGE_PATTERN,
            function (array $matches) use ($uploadedBy, $context, &$index): string {
                $binary = base64_decode(preg_replace('/\s+/', '', $matches[5]), true);

                if ($binary === false || $binary === '') {
                    throw new InvalidArgumentException('Ảnh dán trong nội dung không có dữ liệu base64 hợp lệ.');
                }

                if (strlen($binary) > self::MAX_IMAGE_BYTES) {
                    throw new InvalidArgumentException('Mỗi ảnh dán trong nội dung không được vượt quá 10 MB.');
                }

                $index++;
                $media = $this->mediaStorage->storeInlineImage(
                    $binary,
                    'image/'.strtolower($matches[4]),
                    $context.' - ảnh '.$index,
                    $uploadedBy,
                );

                return $matches[1].$matches[2].$media->url.$matches[2];
            },
            $html,
        );

        if ($normalized === null || str_contains($normalized, 'data:image')) {
            throw new InvalidArgumentException('Không thể chuyển toàn bộ ảnh dán sang Media Library.');
        }

        return $normalized;
    }
}
