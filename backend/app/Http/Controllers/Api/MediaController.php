<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Media;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Intervention\Image\Laravel\Facades\Image;
use Illuminate\Support\Str;

class MediaController extends Controller
{
    /**
     * Get list of uploaded media.
     */
    public function index(Request $request)
    {
        $query = Media::query();

        if ($request->has('mime_type') && !empty($request->mime_type)) {
            $query->where('mime_type', 'like', "%{$request->mime_type}%");
        }

        if ($request->has('q') && !empty($request->q)) {
            $query->where('name', 'like', "%{$request->q}%")
                  ->orWhere('file_name', 'like', "%{$request->q}%");
        }

        $perPage = $request->get('per_page', 18);
        $media = $query->orderBy('created_at', 'desc')->paginate($perPage);

        return response()->json([
            'success' => true,
            'data' => $media->items(),
            'meta' => [
                'current_page' => $media->currentPage(),
                'last_page' => $media->lastPage(),
                'per_page' => $media->perPage(),
                'total' => $media->total(),
            ]
        ], 200);
    }

    /**
     * Upload and process a new file (with WebP conversion fallback).
     */
    public function upload(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'file' => 'required|file|max:102400|mimes:jpg,jpeg,png,gif,webp,svg,pdf,doc,docx,mp4,webm,mov',
            'name' => 'nullable|string|max:255',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        $file = $request->file('file');
        $originalName = pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME);
        $displayName = $request->get('name', $originalName);
        $extension = $file->getClientOriginalExtension();
        $mimeType = $file->getClientMimeType();
        $size = $file->getSize();

        // Target storage info
        $folder = 'media';
        $disk = 'public';

        // Check if file is image and try to convert to WebP
        $isImage = str_contains($mimeType, 'image') && !in_array(strtolower($extension), ['gif', 'svg', 'webp']);
        $savedPath = '';
        $fileName = '';

        if ($isImage) {
            try {
                $fileName = Str::slug($originalName) . '-' . time() . '.webp';
                $savedPath = $folder . '/' . $fileName;

                // Read and encode to webp using Intervention Image v3
                $image = Image::read($file);
                $encoded = $image->toWebp(85);

                Storage::disk($disk)->put($savedPath, $encoded);
                $mimeType = 'image/webp';
                $size = Storage::disk($disk)->size($savedPath);
            } catch (\Exception $e) {
                // Fallback to standard upload if Intervention fails
                $fileName = Str::slug($originalName) . '-' . time() . '.' . $extension;
                $savedPath = $file->storeAs($folder, $fileName, $disk);
            }
        } else {
            // Document or PDF upload
            $fileName = Str::slug($originalName) . '-' . time() . '.' . $extension;
            $savedPath = $file->storeAs($folder, $fileName, $disk);
        }

        // Get public URL
        $url = Storage::disk($disk)->url($savedPath);

        // Save entry to DB
        $media = Media::create([
            'name' => $displayName,
            'file_name' => $fileName,
            'mime_type' => $mimeType,
            'size' => $size,
            'path' => $savedPath,
            'url' => $url,
            'uploaded_by' => $request->user() ? $request->user()->id : null,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'File uploaded successfully',
            'data' => $media
        ], 201);
    }

    /**
     * Delete media item.
     */
    public function destroy($id)
    {
        $media = Media::find($id);

        if (!$media) {
            return response()->json([
                'success' => false,
                'message' => 'Media not found'
            ], 404);
        }

        // Delete from storage
        if (Storage::disk('public')->exists($media->path)) {
            Storage::disk('public')->delete($media->path);
        }

        // Delete from DB
        $media->delete();

        return response()->json([
            'success' => true,
            'message' => 'Media deleted successfully'
        ], 200);
    }
}
