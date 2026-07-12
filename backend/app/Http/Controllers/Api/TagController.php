<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Tag;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class TagController extends Controller
{
    public function index(Request $request)
    {
        $query = Tag::query();
        $postTypes = array_values(array_filter(is_array($request->input('post_type'))
            ? $request->input('post_type')
            : explode(',', (string) $request->input('post_type'))));

        if ($request->filled('q')) {
            $search = trim($request->q);
            $query->where(fn ($tags) => $tags
                ->where('name', 'like', '%' . $search . '%')
                ->orWhere('slug', 'like', '%' . $search . '%'));
        }

        if ($postTypes) {
            $query->whereHas('posts', fn ($posts) => $posts
                ->where('status', 'published')
                ->whereIn('post_type', $postTypes));
        }

        if ($request->boolean('with_count')) {
            $query->withCount(['posts' => function ($posts) use ($postTypes) {
                $posts->where('status', 'published');
                if ($postTypes) {
                    $posts->whereIn('post_type', $postTypes);
                }
            }]);
        }

        return response()->json(['success' => true, 'data' => $query->orderBy('name')->get()]);
    }

    public function store(Request $request)
    {
        $name = trim((string) $request->input('name'));
        $slug = $this->normalizeSlug($request->input('slug') ?: $name);
        $validator = Validator::make(['name' => $name, 'slug' => $slug], [
            'name' => [
                'required', 'string', 'max:255',
                Rule::unique('tags', 'name')->where(fn ($query) => $query->whereRaw('LOWER(name) = ?', [mb_strtolower($name)])),
            ],
            'slug' => 'required|string|max:255|unique:tags,slug',
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'message' => 'Validation error', 'errors' => $validator->errors()], 422);
        }

        $tag = Tag::create(['name' => $name, 'slug' => $slug]);
        return response()->json(['success' => true, 'message' => 'Tag created successfully', 'data' => $tag], 201);
    }

    public function update(Request $request, Tag $tag)
    {
        $name = trim((string) $request->input('name'));
        $slug = $this->normalizeSlug($request->input('slug') ?: $name);
        $validator = Validator::make(['name' => $name, 'slug' => $slug], [
            'name' => [
                'required', 'string', 'max:255',
                Rule::unique('tags', 'name')->ignore($tag->id)->where(fn ($query) => $query->whereRaw('LOWER(name) = ?', [mb_strtolower($name)])),
            ],
            'slug' => ['required', 'string', 'max:255', Rule::unique('tags', 'slug')->ignore($tag->id)],
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'message' => 'Validation error', 'errors' => $validator->errors()], 422);
        }

        $tag->update(['name' => $name, 'slug' => $slug]);
        return response()->json(['success' => true, 'message' => 'Tag updated successfully', 'data' => $tag]);
    }

    public function destroy(Tag $tag)
    {
        if ($tag->posts()->exists() || $tag->projects()->exists()) {
            return response()->json(['success' => false, 'message' => 'Không thể xóa tag đang được sử dụng.'], 409);
        }

        $tag->delete();
        return response()->json(['success' => true, 'message' => 'Tag deleted successfully']);
    }

    private function normalizeSlug(string $value): string
    {
        return preg_replace('/-+/', '-', Str::slug(trim($value), '-', 'vi'));
    }
}
