<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Page;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class PageController extends Controller
{
    /**
     * Get list of pages with pagination.
     */
    public function index(Request $request)
    {
        $query = Page::query()->with(['creator', 'seoMeta']);

        // Check if user is staff (super_admin, admin, marketing)
        $user = $request->user('sanctum');
        if (!$user || !$user->hasAnyRole(['super_admin', 'admin', 'marketing'])) {
            $query->where('status', 'published');
        } elseif ($request->has('status') && !empty($request->status) && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        // Search by query
        if ($request->has('q') && !empty($request->q)) {
            $search = $request->q;
            $query->where(function($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('content', 'like', "%{$search}%");
            });
        }

        $perPage = $request->get('per_page', 10);
        $pages = $query->orderBy('created_at', 'desc')->paginate($perPage);

        return response()->json([
            'success' => true,
            'data' => $pages->items(),
            'meta' => [
                'current_page' => $pages->currentPage(),
                'last_page' => $pages->lastPage(),
                'per_page' => $pages->perPage(),
                'total' => $pages->total(),
            ]
        ], 200);
    }

    /**
     * Get page details by ID or Slug.
     */
    public function show(Request $request, $slugOrId)
    {
        $page = null;
        if (is_numeric($slugOrId)) {
            $page = Page::with(['creator', 'seoMeta'])->find($slugOrId);
        } else {
            $page = Page::with(['creator', 'seoMeta'])->where('slug', $slugOrId)->first();
        }

        if (!$page) {
            return response()->json([
                'success' => false,
                'message' => 'Page not found'
            ], 404);
        }

        // Access check for drafts
        if ($page->status === 'draft') {
            $user = $request->user('sanctum');
            if (!$user || !$user->hasAnyRole(['super_admin', 'admin', 'marketing'])) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized access to draft page'
                ], 403);
            }
        }

        return response()->json([
            'success' => true,
            'data' => $page
        ], 200);
    }

    /**
     * Create a new static page.
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'title' => 'required|string|max:255',
            'slug' => 'required|string|max:255|unique:pages,slug',
            'content' => 'nullable|string',
            'status' => 'required|string|in:draft,published',
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

        $page = Page::create([
            'title' => $request->title,
            'slug' => $request->slug,
            'content' => $request->content,
            'status' => $request->status,
            'created_by' => $request->user()->id,
        ]);

        // Create SEO Meta
        $page->seoMeta()->create([
            'title' => $request->get('seo_title', $page->title),
            'description' => $request->get('seo_description', strip_tags(substr($page->content ?? '', 0, 160))),
            'keywords' => $request->get('seo_keywords'),
            'path' => '/chuyen-trang/' . $page->slug,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Page created successfully',
            'data' => $page->load(['creator', 'seoMeta'])
        ], 201);
    }

    /**
     * Update an existing page.
     */
    public function update(Request $request, $id)
    {
        $page = Page::find($id);

        if (!$page) {
            return response()->json([
                'success' => false,
                'message' => 'Page not found'
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'title' => 'required|string|max:255',
            'slug' => 'required|string|max:255|unique:pages,slug,' . $id,
            'content' => 'nullable|string',
            'status' => 'required|string|in:draft,published',
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

        $page->update([
            'title' => $request->title,
            'slug' => $request->slug,
            'content' => $request->content,
            'status' => $request->status,
        ]);

        // Update or create SEO Meta
        $page->seoMeta()->updateOrCreate(
            ['seoable_id' => $page->id, 'seoable_type' => Page::class],
            [
                'title' => $request->get('seo_title', $page->title),
                'description' => $request->get('seo_description', strip_tags(substr($page->content ?? '', 0, 160))),
                'keywords' => $request->get('seo_keywords'),
                'path' => '/chuyen-trang/' . $page->slug,
            ]
        );

        return response()->json([
            'success' => true,
            'message' => 'Page updated successfully',
            'data' => $page->load(['creator', 'seoMeta'])
        ], 200);
    }

    /**
     * Delete a page.
     */
    public function destroy($id)
    {
        $page = Page::find($id);

        if (!$page) {
            return response()->json([
                'success' => false,
                'message' => 'Page not found'
            ], 404);
        }

        // Delete associated SEO Meta
        if ($page->seoMeta) {
            $page->seoMeta()->delete();
        }

        $page->delete();

        return response()->json([
            'success' => true,
            'message' => 'Page deleted successfully'
        ], 200);
    }
}
