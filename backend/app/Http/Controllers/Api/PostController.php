<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Post;
use App\Models\PostCategory;
use Illuminate\Support\Arr;
use Illuminate\Http\Request;

class PostController extends Controller
{
    /**
     * Get list of published posts with filtering and pagination.
     */
    public function index(Request $request)
    {
        $query = Post::query()->with(['category', 'author', 'tags', 'seoMeta', 'mediaItems']);

        // Staff can see draft posts, guests and customers can only see published ones
        $user = $request->user('sanctum');
        if (!$user || !$user->hasAnyRole(['super_admin', 'admin', 'marketing'])) {
            $query->where('status', 'published');
        } elseif ($request->has('status') && !empty($request->status) && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        // Manual relations may contain drafts. They are only needed by the editor,
        // so do not expose them from public collection endpoints.
        if ($user && $user->hasAnyRole(['super_admin', 'admin', 'marketing'])) {
            $query->with('manualRelatedPosts');
        }

        // Filter by id
        if ($request->has('id') && !empty($request->id)) {
            $query->where('id', $request->id);
        }

        if ($request->has('post_type') && !empty($request->post_type)) {
            $postTypes = is_array($request->post_type) ? $request->post_type : explode(',', $request->post_type);
            $query->whereIn('post_type', $postTypes);
        }

        // Search by query
        if ($request->has('q') && !empty($request->q)) {
            $search = $request->q;
            $query->where(function($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('summary', 'like', "%{$search}%")
                  ->orWhere('content', 'like', "%{$search}%");
            });
        }

        // Filter by category slug
        if ($request->has('category') && !empty($request->category)) {
            $categorySlug = $request->category;
            $query->whereHas('category', function($q) use ($categorySlug) {
                $q->where('slug', $categorySlug);
            });
        }

        // Filter by tag slug
        if ($request->has('tag') && !empty($request->tag)) {
            $tagSlug = $request->tag;
            $query->whereHas('tags', function($q) use ($tagSlug) {
                $q->where('slug', $tagSlug);
            });
        }

        $sort = $request->get('sort', 'latest');
        if ($sort === 'oldest') $query->orderBy('published_at')->orderBy('id');
        elseif ($sort === 'title') $query->orderBy('title')->orderBy('id');
        else $query->orderBy('published_at', 'desc')->orderBy('id', 'desc');

        $perPage = min(100, max(1, (int) $request->get('per_page', 9)));
        $posts = $query->paginate($perPage);

        return response()->json([
            'success' => true,
            'data' => $posts->items(),
            'meta' => [
                'current_page' => $posts->currentPage(),
                'last_page' => $posts->lastPage(),
                'per_page' => $posts->perPage(),
                'total' => $posts->total(),
            ]
        ], 200);
    }

    /**
     * Get featured posts.
     */
    public function featured(Request $request)
    {
        $limit = $request->get('limit', 4);
        $posts = Post::where('status', 'published')
            ->where('is_featured', true)
            ->with(['category', 'author', 'tags', 'seoMeta', 'mediaItems'])
            ->when($request->filled('post_type'), function ($query) use ($request) {
                $postTypes = is_array($request->post_type) ? $request->post_type : explode(',', $request->post_type);
                $query->whereIn('post_type', $postTypes);
            })
            ->orderBy('published_at', 'desc')
            ->limit($limit)
            ->get();

        return response()->json([
            'success' => true,
            'data' => $posts
        ], 200);
    }

    /**
     * Get post details by slug.
     */
    public function show($slug)
    {
        $post = Post::where('slug', $slug)
            ->where('status', 'published')
            ->with(['category', 'author', 'tags', 'seoMeta', 'mediaItems', 'manualRelatedPosts'])
            ->first();

        if (!$post) {
            return response()->json([
                'success' => false,
                'message' => 'Article not found'
            ], 404);
        }

        $manualInline = $post->manualRelatedPosts
            ->filter(fn (Post $item) => $item->status === 'published'
                && $item->post_type === $post->post_type
                && filled($item->slug))
            ->take(3)
            ->values();
        $inlineRelated = $manualInline->concat(
            $this->findRelatedPosts($post, 3 - $manualInline->count(), $manualInline->pluck('id')->all())
        )->take(3)->values();
        $post->setRelation('manualRelatedPosts', $manualInline);
        $relatedPosts = $this->findRelatedPosts($post, 6);

        $publishedAt = $post->published_at ?: $post->created_at;

        $previous = Post::where('id', '!=', $post->id)
            ->where('status', 'published')
            ->where('post_type', $post->post_type)
            ->where(function ($query) use ($publishedAt, $post) {
                $query->where('published_at', '<', $publishedAt)
                    ->orWhere(function ($q) use ($publishedAt, $post) {
                        $q->where('published_at', $publishedAt)
                            ->where('id', '<', $post->id);
                    });
            })
            ->with(['category', 'author', 'tags', 'mediaItems'])
            ->orderBy('published_at', 'desc')
            ->orderBy('id', 'desc')
            ->first();

        $next = Post::where('id', '!=', $post->id)
            ->where('status', 'published')
            ->where('post_type', $post->post_type)
            ->where(function ($query) use ($publishedAt, $post) {
                $query->where('published_at', '>', $publishedAt)
                    ->orWhere(function ($q) use ($publishedAt, $post) {
                        $q->where('published_at', $publishedAt)
                            ->where('id', '>', $post->id);
                    });
            })
            ->with(['category', 'author', 'tags', 'mediaItems'])
            ->orderBy('published_at', 'asc')
            ->orderBy('id', 'asc')
            ->first();

        return response()->json([
            'success' => true,
            'data' => [
                'post' => $post,
                'inline_related' => $inlineRelated,
                'related' => $relatedPosts,
                'previous' => $previous,
                'next' => $next
            ]
        ], 200);
    }

    /**
     * Get list of post categories.
     */
    public function categories(Request $request)
    {
        $postTypes = $request->filled('post_type')
            ? (is_array($request->post_type) ? $request->post_type : explode(',', $request->post_type))
            : null;
        $excludedTypes = $request->filled('exclude_post_type')
            ? (is_array($request->exclude_post_type) ? $request->exclude_post_type : explode(',', $request->exclude_post_type))
            : [];
        $categories = PostCategory::withCount(['posts' => function($q) use ($postTypes, $excludedTypes) {
            $q->where('status', 'published');
            if ($postTypes) $q->whereIn('post_type', $postTypes);
            if ($excludedTypes) $q->whereNotIn('post_type', $excludedTypes);
        }])->get();

        return response()->json([
            'success' => true,
            'data' => $categories
        ], 200);
    }

    /**
     * Create a new post (Admin/Marketing only).
     */
    public function store(Request $request)
    {
        $validator = \Illuminate\Support\Facades\Validator::make($request->all(), [
            'title' => 'required|string|max:255',
            'slug' => 'required|string|max:255|unique:posts',
            'post_type' => 'nullable|string|in:news,investment,event',
            'summary' => 'nullable|string',
            'intro_content' => 'nullable|string',
            'content' => 'nullable|string',
            'thumbnail' => 'nullable|string',
            'status' => 'required|string|in:draft,published,scheduled',
            'is_featured' => 'boolean',
            'post_category_id' => 'required|exists:post_categories,id',
            'event_start_at' => 'nullable|date',
            'event_end_at' => 'nullable|date|after_or_equal:event_start_at',
            'event_location' => 'nullable|string|max:255',
            'event_register_url' => 'nullable|string|max:255',
            'media_items' => 'nullable|array',
            'media_items.*.type' => 'required_with:media_items|string|in:image,video_upload,youtube,document',
            'media_items.*.title' => 'nullable|string|max:255',
            'media_items.*.url' => 'nullable|string|max:2048',
            'media_items.*.thumbnail_url' => 'nullable|string|max:2048',
            'media_items.*.media_id' => 'nullable|integer|exists:media,id',
            'media_items.*.mime_type' => 'nullable|string|max:255',
            'media_items.*.file_size' => 'nullable|integer|min:0',
            'media_items.*.sort_order' => 'nullable|integer|min:0',
            'media_items.*.meta' => 'nullable|array',
            'tag_ids' => 'nullable|array|distinct',
            'tag_ids.*' => 'integer|exists:tags,id',
            'related_post_ids' => 'nullable|array|max:3|distinct',
            'related_post_ids.*' => 'integer|exists:posts,id',
            // SEO Meta
            'seo_title' => 'nullable|string|max:255',
            'seo_description' => 'nullable|string',
            'seo_keywords' => 'nullable|string|max:255',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        if ($message = $this->relatedIdsError($request->input('related_post_ids', []), $request->get('post_type', 'news'))) {
            return response()->json(['success' => false, 'message' => 'Validation error', 'errors' => ['related_post_ids' => [$message]]], 422);
        }

        // Create post
        $post = Post::create([
            'title' => $request->title,
            'slug' => $request->slug,
            'post_type' => $request->get('post_type', 'news'),
            'summary' => $request->summary,
            'intro_content' => $request->intro_content,
            'content' => $request->content,
            'thumbnail' => $request->thumbnail,
            'status' => $request->status,
            'is_featured' => $request->get('is_featured', false),
            'post_category_id' => $request->post_category_id,
            'author_id' => $request->user()->id,
            'published_at' => $request->status === 'published' ? now() : null,
            'event_start_at' => $request->event_start_at,
            'event_end_at' => $request->event_end_at,
            'event_location' => $request->event_location,
            'event_register_url' => $request->event_register_url,
        ]);

        // Create SEO Meta
        $post->seoMeta()->create([
            'title' => $request->get('seo_title', $post->title),
            'description' => $request->get('seo_description', $post->summary),
            'keywords' => $request->get('seo_keywords'),
        ]);

        $this->syncMediaItems($post, $request->input('media_items', []));
        if ($request->has('tag_ids')) $post->tags()->sync($request->input('tag_ids', []));
        if ($request->has('related_post_ids')) $this->syncManualRelatedPosts($post, $request->input('related_post_ids', []));

        return response()->json([
            'success' => true,
            'message' => 'Post created successfully',
            'data' => $post->load(['category', 'author', 'tags', 'seoMeta', 'mediaItems', 'manualRelatedPosts'])
        ], 201);
    }

    /**
     * Update an existing post.
     */
    public function update(Request $request, $id)
    {
        $post = Post::find($id);

        if (!$post) {
            return response()->json([
                'success' => false,
                'message' => 'Post not found'
            ], 404);
        }

        $validator = \Illuminate\Support\Facades\Validator::make($request->all(), [
            'title' => 'required|string|max:255',
            'slug' => 'required|string|max:255|unique:posts,slug,' . $id,
            'post_type' => 'nullable|string|in:news,investment,event',
            'summary' => 'nullable|string',
            'intro_content' => 'nullable|string',
            'content' => 'nullable|string',
            'thumbnail' => 'nullable|string',
            'status' => 'required|string|in:draft,published,scheduled',
            'is_featured' => 'boolean',
            'post_category_id' => 'required|exists:post_categories,id',
            'event_start_at' => 'nullable|date',
            'event_end_at' => 'nullable|date|after_or_equal:event_start_at',
            'event_location' => 'nullable|string|max:255',
            'event_register_url' => 'nullable|string|max:255',
            'media_items' => 'nullable|array',
            'media_items.*.type' => 'required_with:media_items|string|in:image,video_upload,youtube,document',
            'media_items.*.title' => 'nullable|string|max:255',
            'media_items.*.url' => 'nullable|string|max:2048',
            'media_items.*.thumbnail_url' => 'nullable|string|max:2048',
            'media_items.*.media_id' => 'nullable|integer|exists:media,id',
            'media_items.*.mime_type' => 'nullable|string|max:255',
            'media_items.*.file_size' => 'nullable|integer|min:0',
            'media_items.*.sort_order' => 'nullable|integer|min:0',
            'media_items.*.meta' => 'nullable|array',
            'tag_ids' => 'nullable|array|distinct',
            'tag_ids.*' => 'integer|exists:tags,id',
            'related_post_ids' => 'nullable|array|max:3|distinct',
            'related_post_ids.*' => 'integer|exists:posts,id',
            // SEO Meta
            'seo_title' => 'nullable|string|max:255',
            'seo_description' => 'nullable|string',
            'seo_keywords' => 'nullable|string|max:255',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        if ($message = $this->relatedIdsError($request->input('related_post_ids', []), $request->get('post_type', 'news'), $post->id)) {
            return response()->json(['success' => false, 'message' => 'Validation error', 'errors' => ['related_post_ids' => [$message]]], 422);
        }

        $oldStatus = $post->status;
        
        $post->update([
            'title' => $request->title,
            'slug' => $request->slug,
            'post_type' => $request->get('post_type', 'news'),
            'summary' => $request->summary,
            'intro_content' => $request->intro_content,
            'content' => $request->content,
            'thumbnail' => $request->thumbnail,
            'status' => $request->status,
            'is_featured' => $request->get('is_featured', false),
            'post_category_id' => $request->post_category_id,
            'published_at' => ($request->status === 'published' && $oldStatus !== 'published') ? now() : $post->published_at,
            'event_start_at' => $request->event_start_at,
            'event_end_at' => $request->event_end_at,
            'event_location' => $request->event_location,
            'event_register_url' => $request->event_register_url,
        ]);

        // Update or create SEO Meta
        $post->seoMeta()->updateOrCreate(
            ['seoable_id' => $post->id, 'seoable_type' => Post::class],
            [
                'title' => $request->get('seo_title', $post->title),
                'description' => $request->get('seo_description', $post->summary),
                'keywords' => $request->get('seo_keywords'),
            ]
        );

        $this->syncMediaItems($post, $request->input('media_items', []));
        if ($request->has('tag_ids')) $post->tags()->sync($request->input('tag_ids', []));
        if ($request->has('related_post_ids')) $this->syncManualRelatedPosts($post, $request->input('related_post_ids', []));

        return response()->json([
            'success' => true,
            'message' => 'Post updated successfully',
            'data' => $post->load(['category', 'author', 'tags', 'seoMeta', 'mediaItems', 'manualRelatedPosts'])
        ], 200);
    }

    /**
     * Delete a post.
     */
    public function destroy($id)
    {
        $post = Post::find($id);

        if (!$post) {
            return response()->json([
                'success' => false,
                'message' => 'Post not found'
            ], 404);
        }

        // Delete SEO meta first
        if ($post->seoMeta) {
            $post->seoMeta->delete();
        }

        $post->tags()->detach();
        $post->manualRelatedPosts()->detach();

        $post->delete();

        return response()->json([
            'success' => true,
            'message' => 'Post deleted successfully'
        ], 200);
    }

    /**
     * Create post category.
     */
    public function storeCategory(Request $request)
    {
        $validator = \Illuminate\Support\Facades\Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'slug' => 'required|string|max:255|unique:post_categories',
            'description' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        $category = PostCategory::create($request->only(['name', 'slug', 'description']));

        return response()->json([
            'success' => true,
            'message' => 'Category created successfully',
            'data' => $category
        ], 201);
    }

    /**
     * Update post category.
     */
    public function updateCategory(Request $request, $id)
    {
        $category = PostCategory::find($id);

        if (!$category) {
            return response()->json([
                'success' => false,
                'message' => 'Category not found'
            ], 404);
        }

        $validator = \Illuminate\Support\Facades\Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'slug' => 'required|string|max:255|unique:post_categories,slug,' . $id,
            'description' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        $category->update($request->only(['name', 'slug', 'description']));

        return response()->json([
            'success' => true,
            'message' => 'Category updated successfully',
            'data' => $category
        ], 200);
    }

    /**
     * Delete post category.
     */
    public function destroyCategory($id)
    {
        $category = PostCategory::find($id);

        if (!$category) {
            return response()->json([
                'success' => false,
                'message' => 'Category not found'
            ], 404);
        }

        // Check if there are posts in this category
        if ($category->posts()->count() > 0) {
            return response()->json([
                'success' => false,
                'message' => 'Cannot delete category containing articles. Move articles first.'
            ], 400);
        }

        $category->delete();

        return response()->json([
            'success' => true,
            'message' => 'Category deleted successfully'
        ], 200);
    }

    private function syncMediaItems(Post $post, array $items): void
    {
        $post->mediaItems()->delete();

        foreach (array_values($items) as $index => $item) {
            $type = Arr::get($item, 'type');
            $url = Arr::get($item, 'url');

            if (!$type || (!$url && !Arr::get($item, 'media_id'))) {
                continue;
            }

            $post->mediaItems()->create([
                'media_id' => Arr::get($item, 'media_id'),
                'type' => $type,
                'title' => Arr::get($item, 'title'),
                'url' => $url,
                'thumbnail_url' => Arr::get($item, 'thumbnail_url'),
                'mime_type' => Arr::get($item, 'mime_type'),
                'file_size' => Arr::get($item, 'file_size'),
                'sort_order' => Arr::get($item, 'sort_order', $index),
                'meta' => Arr::get($item, 'meta'),
            ]);
        }
    }

    private function syncManualRelatedPosts(Post $post, array $ids): void
    {
        $sync = [];
        foreach (array_values($ids) as $index => $id) {
            $sync[(int) $id] = ['sort_order' => $index];
        }
        $post->manualRelatedPosts()->sync($sync);
    }

    private function relatedIdsError(array $ids, string $postType, ?int $currentId = null): ?string
    {
        if ($currentId && in_array($currentId, array_map('intval', $ids), true)) {
            return 'Bài viết không thể tự liên kết chính nó.';
        }

        if (!$ids) return null;

        $validCount = Post::query()
            ->whereIn('id', $ids)
            ->where('status', 'published')
            ->where('post_type', $postType)
            ->whereNotNull('slug')
            ->where('slug', '!=', '')
            ->count();

        return $validCount === count($ids)
            ? null
            : 'Chỉ được chọn bài đã xuất bản, có slug và cùng loại nội dung.';
    }

    private function findRelatedPosts(Post $post, int $limit, array $extraExcludedIds = [])
    {
        if ($limit <= 0) return collect();

        $excludedIds = collect($extraExcludedIds)->push($post->id)->unique()->values();
        $base = fn () => Post::query()
            ->where('status', 'published')
            ->where('post_type', $post->post_type)
            ->whereNotIn('id', $excludedIds)
            ->whereNotNull('slug')
            ->where('slug', '!=', '')
            ->with(['category', 'author', 'tags', 'mediaItems']);

        $sameCategory = $base()
            ->where('post_category_id', $post->post_category_id)
            ->orderBy('published_at', 'desc')
            ->limit($limit)
            ->get();

        if ($sameCategory->count() >= $limit) return $sameCategory;

        $latest = $base()
            ->whereNotIn('id', $sameCategory->pluck('id'))
            ->orderBy('published_at', 'desc')
            ->limit($limit - $sameCategory->count())
            ->get();

        return $sameCategory->concat($latest)->values();
    }
}
