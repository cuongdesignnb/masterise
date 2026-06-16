<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Post;
use App\Models\PostCategory;
use Illuminate\Http\Request;

class PostController extends Controller
{
    /**
     * Get list of published posts with filtering and pagination.
     */
    public function index(Request $request)
    {
        $query = Post::query()->with(['category', 'author', 'tags', 'seoMeta']);

        // Staff can see draft posts, guests and customers can only see published ones
        $user = $request->user('sanctum');
        if (!$user || !$user->hasAnyRole(['super_admin', 'admin', 'marketing'])) {
            $query->where('status', 'published');
        } elseif ($request->has('status') && !empty($request->status) && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        // Filter by id
        if ($request->has('id') && !empty($request->id)) {
            $query->where('id', $request->id);
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

        $perPage = $request->get('per_page', 9);
        $posts = $query->orderBy('published_at', 'desc')->paginate($perPage);

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
            ->with(['category', 'author', 'seoMeta'])
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
            ->with(['category', 'author', 'tags', 'seoMeta'])
            ->first();

        if (!$post) {
            return response()->json([
                'success' => false,
                'message' => 'Article not found'
            ], 404);
        }

        // Get related articles in same category
        $relatedPosts = Post::where('id', '!=', $post->id)
            ->where('status', 'published')
            ->where('post_category_id', $post->post_category_id)
            ->limit(3)
            ->get();

        return response()->json([
            'success' => true,
            'data' => [
                'post' => $post,
                'related' => $relatedPosts
            ]
        ], 200);
    }

    /**
     * Get list of post categories.
     */
    public function categories()
    {
        $categories = PostCategory::withCount(['posts' => function($q) {
            $q->where('status', 'published');
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
            'summary' => 'nullable|string',
            'content' => 'nullable|string',
            'thumbnail' => 'nullable|string',
            'status' => 'required|string|in:draft,published',
            'is_featured' => 'boolean',
            'post_category_id' => 'required|exists:post_categories,id',
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

        // Create post
        $post = Post::create([
            'title' => $request->title,
            'slug' => $request->slug,
            'summary' => $request->summary,
            'content' => $request->content,
            'thumbnail' => $request->thumbnail,
            'status' => $request->status,
            'is_featured' => $request->get('is_featured', false),
            'post_category_id' => $request->post_category_id,
            'author_id' => $request->user()->id,
            'published_at' => $request->status === 'published' ? now() : null,
        ]);

        // Create SEO Meta
        $post->seoMeta()->create([
            'title' => $request->get('seo_title', $post->title),
            'description' => $request->get('seo_description', $post->summary),
            'keywords' => $request->get('seo_keywords'),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Post created successfully',
            'data' => $post->load(['category', 'author', 'seoMeta'])
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
            'summary' => 'nullable|string',
            'content' => 'nullable|string',
            'thumbnail' => 'nullable|string',
            'status' => 'required|string|in:draft,published',
            'is_featured' => 'boolean',
            'post_category_id' => 'required|exists:post_categories,id',
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

        $oldStatus = $post->status;
        
        $post->update([
            'title' => $request->title,
            'slug' => $request->slug,
            'summary' => $request->summary,
            'content' => $request->content,
            'thumbnail' => $request->thumbnail,
            'status' => $request->status,
            'is_featured' => $request->get('is_featured', false),
            'post_category_id' => $request->post_category_id,
            'published_at' => ($request->status === 'published' && $oldStatus !== 'published') ? now() : $post->published_at,
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

        return response()->json([
            'success' => true,
            'message' => 'Post updated successfully',
            'data' => $post->load(['category', 'author', 'seoMeta'])
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
}
