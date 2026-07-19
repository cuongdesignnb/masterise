<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\PostCardResource;
use App\Http\Resources\PostDetailResource;
use App\Http\Resources\PostListResource;
use App\Models\Post;
use App\Models\PostCategory;
use App\Services\InlineArticleImageNormalizer;
use App\Support\PublicContentCache;
use App\Support\PublicSlug;
use Illuminate\Http\Request;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\Validator;
use InvalidArgumentException;

class PostController extends Controller
{
    public function __construct(private readonly InlineArticleImageNormalizer $inlineImageNormalizer) {}

    /**
     * Get list of published posts with filtering and pagination.
     */
    public function index(Request $request)
    {
        // Staff can see draft posts, guests and customers can only see published ones
        $user = $request->user('sanctum');
        $canViewUnpublished = $user && $user->hasAnyRole(['super_admin', 'admin', 'marketing']);
        $query = $canViewUnpublished
            ? Post::query()->with(['category', 'author', 'tags', 'seoMeta', 'mediaItems'])
            : Post::query()->select([
                'id', 'title', 'slug', 'post_type', 'summary', 'thumbnail', 'status', 'is_featured',
                'post_category_id', 'author_id', 'published_at', 'event_start_at', 'event_end_at',
                'event_location', 'event_register_url', 'created_at', 'updated_at',
            ])->with(['category:id,name,slug', 'author:id,name,avatar', 'tags:id,name,slug']);
        if (! $canViewUnpublished) {
            $query->where('status', 'published');
        } elseif ($request->has('status') && ! empty($request->status) && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        // Manual relations may contain drafts. They are only needed by the editor,
        // so do not expose them from public collection endpoints.
        if ($canViewUnpublished) {
            $query->with('manualRelatedPosts');
        }

        // Filter by id
        if ($request->has('id') && ! empty($request->id)) {
            $query->where('id', $request->id);
        }

        if ($request->has('post_type') && ! empty($request->post_type)) {
            $postTypes = is_array($request->post_type) ? $request->post_type : explode(',', $request->post_type);
            $query->whereIn('post_type', $postTypes);
        }

        // Search by query
        if ($request->has('q') && ! empty($request->q)) {
            $search = $request->q;
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                    ->orWhere('summary', 'like', "%{$search}%")
                    ->orWhere('content', 'like', "%{$search}%");
            });
        }

        // Filter by category slug
        if ($request->has('category') && ! empty($request->category)) {
            $categorySlug = $request->category;
            $query->whereHas('category', function ($q) use ($categorySlug) {
                $q->where('slug', $categorySlug);
            });
        }

        // Filter by tag slug
        if ($request->has('tag') && ! empty($request->tag)) {
            $tagSlug = $request->tag;
            $query->whereHas('tags', function ($q) use ($tagSlug) {
                $q->where('slug', $tagSlug);
            });
        }

        $sort = $request->get('sort', 'latest');
        if ($sort === 'oldest') {
            $query->orderBy('published_at')->orderBy('id');
        } elseif ($sort === 'title') {
            $query->orderBy('title')->orderBy('id');
        } else {
            $query->orderBy('published_at', 'desc')->orderBy('id', 'desc');
        }

        $perPage = min($canViewUnpublished ? 100 : 50, max(1, $request->integer('per_page', 12)));
        $resolve = function () use ($query, $perPage, $request, $canViewUnpublished): array {
            $posts = $query->paginate($perPage);

            return [
                'success' => true,
                'data' => $canViewUnpublished
                    ? $posts->items()
                    : PostListResource::collection($posts->items())->resolve($request),
                'meta' => [
                    'current_page' => $posts->currentPage(),
                    'last_page' => $posts->lastPage(),
                    'per_page' => $posts->perPage(),
                    'total' => $posts->total(),
                ],
            ];
        };
        $payload = $canViewUnpublished
            ? $resolve()
            : PublicContentCache::remember('posts.list', $request->query(), 300, $resolve);

        $response = response()->json($payload, 200);

        return $canViewUnpublished
            ? $response->header('Cache-Control', 'no-store')
            : $response->header('Cache-Control', 'public, max-age=60, s-maxage=300, stale-while-revalidate=60');
    }

    /**
     * Get featured posts.
     */
    public function featured(Request $request)
    {
        $limit = min(8, max(1, $request->integer('limit', 4)));
        $posts = PublicContentCache::remember('posts.featured', [
            'limit' => $limit,
            'post_type' => $request->input('post_type'),
        ], 600, function () use ($request, $limit): array {
            $items = Post::query()->select([
                'id', 'title', 'slug', 'post_type', 'summary', 'thumbnail', 'status', 'is_featured',
                'post_category_id', 'author_id', 'published_at', 'event_start_at', 'event_end_at',
                'event_location', 'event_register_url', 'created_at', 'updated_at',
            ])->where('status', 'published')
                ->where('is_featured', true)
                ->with(['category:id,name,slug', 'author:id,name,avatar', 'tags:id,name,slug'])
                ->when($request->filled('post_type'), function ($query) use ($request) {
                    $postTypes = is_array($request->post_type) ? $request->post_type : explode(',', $request->post_type);
                    $query->whereIn('post_type', $postTypes);
                })
                ->orderBy('published_at', 'desc')
                ->limit($limit)
                ->get();

            return PostListResource::collection($items)->resolve($request);
        });

        return response()->json([
            'success' => true,
            'data' => $posts,
        ], 200)->header('Cache-Control', 'public, max-age=60, s-maxage=600, stale-while-revalidate=60');
    }

    /**
     * Get post details by slug.
     */
    public function show(Request $request, string $slug)
    {
        $payload = PublicContentCache::remember('posts.detail', ['slug' => $slug], 600, function () use ($request, $slug): ?array {
            $post = Post::query()
                ->select($this->postDetailColumns())
                ->where('slug', $slug)
                ->where('status', 'published')
                ->with($this->postDetailRelations())
                ->first();

            if (! $post) {
                return null;
            }

            $manualInline = $post->manualRelatedPosts()
                ->select($this->qualifiedPostCardColumns())
                ->where('posts.status', 'published')
                ->where('posts.post_type', $post->post_type)
                ->whereNotNull('posts.slug')
                ->where('posts.slug', '!=', '')
                ->with($this->postCardRelations())
                ->take(3)
                ->get();
            $inlineRelated = $manualInline->concat(
                $this->findRelatedPosts($post, 3 - $manualInline->count(), $manualInline->pluck('id')->all())
            )->take(3)->values();
            $relatedPosts = $this->findRelatedPosts($post, 6);
            $publishedAt = $post->published_at ?: $post->created_at;
            $previous = $this->adjacentPost($post, $publishedAt, 'previous');
            $next = $this->adjacentPost($post, $publishedAt, 'next');

            return [
                'post' => PostDetailResource::make($post)->resolve($request),
                'inline_related' => PostCardResource::collection($inlineRelated)->resolve($request),
                'related' => PostCardResource::collection($relatedPosts)->resolve($request),
                'previous' => $previous ? PostCardResource::make($previous)->resolve($request) : null,
                'next' => $next ? PostCardResource::make($next)->resolve($request) : null,
            ];
        });

        if ($payload === null) {
            return response()->json([
                'success' => false,
                'message' => 'Article not found',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $payload,
        ], 200)->header('Cache-Control', 'public, max-age=60, s-maxage=600, stale-while-revalidate=120');
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
        $categories = PublicContentCache::remember('posts.taxonomy', [
            'post_type' => $postTypes,
            'exclude_post_type' => $excludedTypes,
        ], 900, function () use ($postTypes, $excludedTypes) {
            return PostCategory::withCount(['posts' => function ($q) use ($postTypes, $excludedTypes) {
                $q->where('status', 'published');
                if ($postTypes) {
                    $q->whereIn('post_type', $postTypes);
                }
                if ($excludedTypes) {
                    $q->whereNotIn('post_type', $excludedTypes);
                }
            }])->get();
        });

        return response()->json([
            'success' => true,
            'data' => $categories,
        ], 200)->header('Cache-Control', 'public, max-age=300, s-maxage=900');
    }

    /**
     * Create a new post (Admin/Marketing only).
     */
    public function store(Request $request)
    {
        $requestedSlug = PublicSlug::normalize($request->input('slug') ?: $request->input('title'));
        $request->merge([
            'slug' => $request->boolean('slug_is_auto')
                ? PublicSlug::unique($requestedSlug)
                : $requestedSlug,
        ]);

        $validator = Validator::make($request->all(), [
            'title' => 'required|string|max:255',
            'slug' => ['required', 'string', 'max:255', 'regex:/^[a-z0-9]+(?:-[a-z0-9]+)*$/', 'unique:posts,slug', PublicSlug::rule()],
            'slug_is_auto' => 'sometimes|boolean',
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
                'errors' => $validator->errors(),
            ], 422);
        }

        if ($message = $this->relatedIdsError($request->input('related_post_ids', []), $request->get('post_type', 'news'))) {
            return response()->json(['success' => false, 'message' => 'Validation error', 'errors' => ['related_post_ids' => [$message]]], 422);
        }

        try {
            $introContent = $this->inlineImageNormalizer->normalize(
                $request->input('intro_content'),
                $request->user()?->id,
                'Mở đầu bài viết '.$request->title,
            );
            $content = $this->inlineImageNormalizer->normalize(
                $request->input('content'),
                $request->user()?->id,
                'Nội dung bài viết '.$request->title,
            );
        } catch (InvalidArgumentException $exception) {
            return response()->json([
                'success' => false,
                'message' => 'Không thể lưu ảnh trong nội dung bài viết.',
                'errors' => ['content' => [$exception->getMessage()]],
            ], 422);
        }

        // Create post
        $post = Post::create([
            'title' => $request->title,
            'slug' => $request->slug,
            'post_type' => $request->get('post_type', 'news'),
            'summary' => $request->summary,
            'intro_content' => $introContent,
            'content' => $content,
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
        if ($request->has('tag_ids')) {
            $post->tags()->sync($request->input('tag_ids', []));
        }
        if ($request->has('related_post_ids')) {
            $this->syncManualRelatedPosts($post, $request->input('related_post_ids', []));
        }
        PublicContentCache::invalidate('posts.list', 'posts.featured', 'posts.detail');

        return response()->json([
            'success' => true,
            'message' => 'Post created successfully',
            'data' => $post->load(['category', 'author', 'tags', 'seoMeta', 'mediaItems', 'manualRelatedPosts']),
        ], 201);
    }

    /**
     * Update an existing post.
     */
    public function update(Request $request, $id)
    {
        $post = Post::find($id);

        if (! $post) {
            return response()->json([
                'success' => false,
                'message' => 'Post not found',
            ], 404);
        }

        $request->merge([
            'slug' => PublicSlug::normalize($request->input('slug') ?: $request->input('title')),
        ]);

        $validator = Validator::make($request->all(), [
            'title' => 'required|string|max:255',
            'slug' => ['required', 'string', 'max:255', 'regex:/^[a-z0-9]+(?:-[a-z0-9]+)*$/', \Illuminate\Validation\Rule::unique('posts', 'slug')->ignore($id), PublicSlug::rule('post', (int) $id)],
            'slug_is_auto' => 'sometimes|boolean',
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
                'errors' => $validator->errors(),
            ], 422);
        }

        if ($message = $this->relatedIdsError($request->input('related_post_ids', []), $request->get('post_type', 'news'), $post->id)) {
            return response()->json(['success' => false, 'message' => 'Validation error', 'errors' => ['related_post_ids' => [$message]]], 422);
        }

        try {
            $introContent = $this->inlineImageNormalizer->normalize(
                $request->input('intro_content'),
                $request->user()?->id,
                'Mở đầu bài viết '.$request->title,
            );
            $content = $this->inlineImageNormalizer->normalize(
                $request->input('content'),
                $request->user()?->id,
                'Nội dung bài viết '.$request->title,
            );
        } catch (InvalidArgumentException $exception) {
            return response()->json([
                'success' => false,
                'message' => 'Không thể lưu ảnh trong nội dung bài viết.',
                'errors' => ['content' => [$exception->getMessage()]],
            ], 422);
        }

        $oldStatus = $post->status;

        $post->update([
            'title' => $request->title,
            'slug' => $request->slug,
            'post_type' => $request->get('post_type', 'news'),
            'summary' => $request->summary,
            'intro_content' => $introContent,
            'content' => $content,
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
        if ($request->has('tag_ids')) {
            $post->tags()->sync($request->input('tag_ids', []));
        }
        if ($request->has('related_post_ids')) {
            $this->syncManualRelatedPosts($post, $request->input('related_post_ids', []));
        }
        PublicContentCache::invalidate('posts.list', 'posts.featured', 'posts.detail');

        return response()->json([
            'success' => true,
            'message' => 'Post updated successfully',
            'data' => $post->load(['category', 'author', 'tags', 'seoMeta', 'mediaItems', 'manualRelatedPosts']),
        ], 200);
    }

    /**
     * Delete a post.
     */
    public function destroy($id)
    {
        $post = Post::find($id);

        if (! $post) {
            return response()->json([
                'success' => false,
                'message' => 'Post not found',
            ], 404);
        }

        // Delete SEO meta first
        if ($post->seoMeta) {
            $post->seoMeta->delete();
        }

        $post->tags()->detach();
        $post->manualRelatedPosts()->detach();

        $post->delete();
        PublicContentCache::invalidate('posts.list', 'posts.featured', 'posts.detail');

        return response()->json([
            'success' => true,
            'message' => 'Post deleted successfully',
        ], 200);
    }

    /**
     * Create post category.
     */
    public function storeCategory(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'slug' => 'required|string|max:255|unique:post_categories',
            'description' => 'nullable|string',
        ], [
            'name.required' => 'Vui lòng nhập tên danh mục.',
            'slug.required' => 'Không thể tạo đường dẫn cho danh mục này.',
            'slug.unique' => 'Danh mục này đã tồn tại. Vui lòng chọn tên khác.',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors(),
            ], 422);
        }

        $category = PostCategory::create($request->only(['name', 'slug', 'description']));
        PublicContentCache::invalidate('posts.taxonomy');

        return response()->json([
            'success' => true,
            'message' => 'Category created successfully',
            'data' => $category,
        ], 201);
    }

    /**
     * Update post category.
     */
    public function updateCategory(Request $request, $id)
    {
        $category = PostCategory::find($id);

        if (! $category) {
            return response()->json([
                'success' => false,
                'message' => 'Category not found',
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'slug' => 'required|string|max:255|unique:post_categories,slug,'.$id,
            'description' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors(),
            ], 422);
        }

        $category->update($request->only(['name', 'slug', 'description']));
        PublicContentCache::invalidate('posts.taxonomy');

        return response()->json([
            'success' => true,
            'message' => 'Category updated successfully',
            'data' => $category,
        ], 200);
    }

    /**
     * Delete post category.
     */
    public function destroyCategory($id)
    {
        $category = PostCategory::find($id);

        if (! $category) {
            return response()->json([
                'success' => false,
                'message' => 'Category not found',
            ], 404);
        }

        // Check if there are posts in this category
        if ($category->posts()->count() > 0) {
            return response()->json([
                'success' => false,
                'message' => 'Cannot delete category containing articles. Move articles first.',
            ], 400);
        }

        $category->delete();
        PublicContentCache::invalidate('posts.taxonomy');

        return response()->json([
            'success' => true,
            'message' => 'Category deleted successfully',
        ], 200);
    }

    private function syncMediaItems(Post $post, array $items): void
    {
        $post->mediaItems()->delete();

        foreach (array_values($items) as $index => $item) {
            $type = Arr::get($item, 'type');
            $url = Arr::get($item, 'url');

            if (! $type || (! $url && ! Arr::get($item, 'media_id'))) {
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

        if (! $ids) {
            return null;
        }

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
        if ($limit <= 0) {
            return collect();
        }

        $excludedIds = collect($extraExcludedIds)->push($post->id)->unique()->values();
        $base = fn () => Post::query()
            ->select($this->postCardColumns())
            ->where('status', 'published')
            ->where('post_type', $post->post_type)
            ->whereNotIn('id', $excludedIds)
            ->whereNotNull('slug')
            ->where('slug', '!=', '')
            ->with($this->postCardRelations());

        $sameCategory = $base()
            ->where('post_category_id', $post->post_category_id)
            ->orderBy('published_at', 'desc')
            ->limit($limit)
            ->get();

        if ($sameCategory->count() >= $limit) {
            return $sameCategory;
        }

        $latest = $base()
            ->whereNotIn('id', $sameCategory->pluck('id'))
            ->orderBy('published_at', 'desc')
            ->limit($limit - $sameCategory->count())
            ->get();

        return $sameCategory->concat($latest)->values();
    }

    private function adjacentPost(Post $post, mixed $publishedAt, string $direction): ?Post
    {
        $isPrevious = $direction === 'previous';
        $operator = $isPrevious ? '<' : '>';
        $idOperator = $isPrevious ? '<' : '>';
        $order = $isPrevious ? 'desc' : 'asc';

        return Post::query()
            ->select($this->postCardColumns())
            ->where('id', '!=', $post->id)
            ->where('status', 'published')
            ->where('post_type', $post->post_type)
            ->where(function ($query) use ($publishedAt, $post, $operator, $idOperator) {
                $query->where('published_at', $operator, $publishedAt)
                    ->orWhere(function ($nested) use ($publishedAt, $post, $idOperator) {
                        $nested->where('published_at', $publishedAt)
                            ->where('id', $idOperator, $post->id);
                    });
            })
            ->with($this->postCardRelations())
            ->orderBy('published_at', $order)
            ->orderBy('id', $order)
            ->first();
    }

    private function postCardColumns(): array
    {
        return [
            'id', 'title', 'slug', 'post_type', 'summary', 'thumbnail', 'status', 'is_featured',
            'post_category_id', 'author_id', 'published_at', 'created_at', 'updated_at',
        ];
    }

    private function qualifiedPostCardColumns(): array
    {
        return array_map(static fn (string $column) => 'posts.'.$column, $this->postCardColumns());
    }

    private function postDetailColumns(): array
    {
        return [
            'id', 'title', 'slug', 'post_type', 'summary', 'intro_content', 'content', 'thumbnail',
            'status', 'is_featured', 'post_category_id', 'author_id', 'published_at',
            'event_start_at', 'event_end_at', 'event_location', 'event_register_url',
            'created_at', 'updated_at',
        ];
    }

    private function postCardRelations(): array
    {
        return [
            'category:id,name,slug',
            'author:id,name,avatar',
            'tags:id,name,slug',
        ];
    }

    private function postDetailRelations(): array
    {
        return [
            ...$this->postCardRelations(),
            'seoMeta',
            'mediaItems',
        ];
    }
}
