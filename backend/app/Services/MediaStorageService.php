<?php

namespace App\Services;

use App\Models\Media;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Intervention\Image\Laravel\Facades\Image;

class MediaStorageService
{
    public function storeUploadedFile(UploadedFile $file, ?string $displayName, ?int $uploadedBy): Media
    {
        $originalName = pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME);
        $name = $displayName ?: $originalName;
        $extension = strtolower($file->getClientOriginalExtension());
        $mimeType = (string) $file->getClientMimeType();

        if (str_starts_with($mimeType, 'image/') && ! in_array($extension, ['gif', 'svg', 'webp'], true)) {
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
