<?php

namespace App\Services;

use App\Models\Media;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Intervention\Image\Laravel\Facades\Image;

class MediaStorageService
{
    public function storeUploadedFile(
        UploadedFile $file,
        ?string $displayName,
        ?int $uploadedBy,
        bool $preserveImage = false,
    ): Media
    {
        $originalName = pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME);
        $name = $displayName ?: $originalName;
        $extension = strtolower($file->getClientOriginalExtension());
        $mimeType = (string) $file->getClientMimeType();
        $detectedMimeType = (string) ($file->getMimeType() ?: $mimeType);

        // Favicon uploads may be supplied as a PNG with an .ico filename. Keep
        // the original bytes and use the actual detected image format so the
        // browser can decode the URL instead of receiving an invalid WebP/ICO.
        if ($preserveImage && str_starts_with($detectedMimeType, 'image/')) {
            [$extension, $mimeType] = $this->imageFormat($detectedMimeType, $extension, $mimeType);
        }

        // Favicon ICO files must remain ICO files. Converting them to WebP makes
        // the browser icon unusable and also loses the multi-size ICO entries.
        if (! $preserveImage && str_starts_with($mimeType, 'image/') && ! in_array($extension, ['gif', 'svg', 'webp', 'ico'], true)) {
            try {
                $encoded = Image::read($file)->toWebp(85);
                $fileName = Str::slug($originalName).'-'.time().'.webp';

                return $this->persist($name, $fileName, 'image/webp', (string) $encoded, $uploadedBy);
            } catch (\Throwable) {
                // Preserve the existing Media Library behavior for image formats
                // that the active Intervention driver cannot decode.
            }
        }

        $fileName = Str::slug($originalName).'-'.time().'.'.$extension;
        $path = $file->storeAs('media', $fileName, 'public');

        return Media::create([
            'name' => $name,
            'file_name' => $fileName,
            'mime_type' => $mimeType,
            'size' => Storage::disk('public')->size($path),
            'path' => $path,
            'url' => Storage::disk('public')->url($path),
            'uploaded_by' => $uploadedBy,
        ]);
    }

    /**
     * Return a stable extension/MIME pair based on the detected file contents.
     * This is intentionally used only for assets that must keep their source
     * format (currently the browser favicon).
     *
     * @return array{0: string, 1: string}
     */
    private function imageFormat(string $detectedMimeType, string $fallbackExtension, string $fallbackMimeType): array
    {
        $formats = [
            'image/x-icon' => ['ico', 'image/x-icon'],
            'image/vnd.microsoft.icon' => ['ico', 'image/x-icon'],
            'image/png' => ['png', 'image/png'],
            'image/gif' => ['gif', 'image/gif'],
            'image/svg+xml' => ['svg', 'image/svg+xml'],
            'image/webp' => ['webp', 'image/webp'],
            'image/jpeg' => ['jpg', 'image/jpeg'],
        ];

        return $formats[$detectedMimeType] ?? [$fallbackExtension, $fallbackMimeType];
    }

    public function storeInlineImage(string $binary, string $sourceMimeType, string $displayName, ?int $uploadedBy): Media
    {
        $hash = hash('sha256', $binary);
        $fileName = 'inline-'.$hash.'.webp';
        $path = 'media/'.$fileName;
        $existing = Media::query()->where('path', $path)->first();

        if ($existing && Storage::disk('public')->exists($path)) {
            return $existing;
        }

        $encoded = Image::read($binary)->toWebp(85);

        if (! Storage::disk('public')->exists($path)) {
            Storage::disk('public')->put($path, (string) $encoded);
        }

        return Media::query()->updateOrCreate(
            ['path' => $path],
            [
                'name' => $displayName,
                'file_name' => $fileName,
                'mime_type' => 'image/webp',
                'size' => Storage::disk('public')->size($path),
                'url' => Storage::disk('public')->url($path),
                'uploaded_by' => $existing?->uploaded_by ?: $uploadedBy,
            ],
        );
    }

    private function persist(string $name, string $fileName, string $mimeType, string $contents, ?int $uploadedBy): Media
    {
        $path = 'media/'.$fileName;
        Storage::disk('public')->put($path, $contents);

        return Media::create([
            'name' => $name,
            'file_name' => $fileName,
            'mime_type' => $mimeType,
            'size' => Storage::disk('public')->size($path),
            'path' => $path,
            'url' => Storage::disk('public')->url($path),
            'uploaded_by' => $uploadedBy,
        ]);
    }
}
