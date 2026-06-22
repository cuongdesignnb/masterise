<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Project;
use App\Models\ProjectCategory;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ProjectController extends Controller
{
    /**
     * Get list of projects with filtering and pagination.
     */
    public function index(Request $request)
    {
        $query = Project::query()->with(['categories', 'seoMeta', 'developerRelation', 'locationRelation']);
        $user = $request->user('sanctum');
        $canViewUnpublished = $user && $user->hasAnyRole(['super_admin', 'admin', 'marketing']);

        if (!$canViewUnpublished) {
            $query->where('is_published', true);
        }

        // Filter by search query
        if ($request->has('q') && !empty($request->q)) {
            $search = $request->q;
            $query->where(function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('location', 'like', "%{$search}%")
                  ->orWhere('developer', 'like', "%{$search}%");
            });
        }

        // Filter by region
        if ($request->has('region') && !empty($request->region)) {
            $query->where('region', $request->region);
        }

        // Filter by status
        if ($request->has('status') && !empty($request->status)) {
            $statuses = is_array($request->status) ? $request->status : explode(',', $request->status);
            $query->whereIn('status', $statuses);
        }

        // Filter by public sales status badge state
        if ($request->has('sales_status') && !empty($request->sales_status)) {
            $salesStatuses = is_array($request->sales_status) ? $request->sales_status : explode(',', $request->sales_status);
            $query->whereIn('sales_status', $salesStatuses);
        }

        if ($request->has('is_hot') && $request->is_hot !== '') {
            $query->where('is_hot', filter_var($request->is_hot, FILTER_VALIDATE_BOOLEAN));
        }

        // Filter by category slug
        if ($request->has('category') && !empty($request->category)) {
            $categorySlug = $request->category;
            $query->whereHas('categories', function($q) use ($categorySlug) {
                $q->where('slug', $categorySlug);
            });
        }

        // Filter by price range
        if ($request->has('price_min')) {
            $query->where('price_max', '>=', $request->price_min);
        }
        if ($request->has('price_max')) {
            $query->where('price_min', '<=', $request->price_max);
        }

        // Sorting
        $sortBy = $request->get('sort_by', 'created_at');
        $sortOrder = $request->get('sort_order', 'desc');

        if (in_array($sortBy, ['price_min', 'handover_year', 'open_sale_at', 'created_at', 'name', 'sort_order'])) {
            $query->orderBy($sortBy, $sortOrder);
        } else {
            $query->orderBy('created_at', 'desc');
        }

        $perPage = $request->get('per_page', 9);
        $projects = $query->paginate($perPage);

        return response()->json([
            'success' => true,
            'data' => $projects->items(),
            'meta' => [
                'current_page' => $projects->currentPage(),
                'last_page' => $projects->lastPage(),
                'per_page' => $projects->perPage(),
                'total' => $projects->total(),
            ]
        ], 200);
    }

    /**
     * Get featured projects.
     */
    public function featured(Request $request)
    {
        $limit = $request->get('limit', 6);
        $query = Project::where('is_featured', true);
        $user = $request->user('sanctum');
        $canViewUnpublished = $user && $user->hasAnyRole(['super_admin', 'admin', 'marketing']);

        if (!$canViewUnpublished) {
            $query->where('is_published', true);
        }

        $projects = $query
            ->with(['categories', 'seoMeta'])
            ->orderByRaw('open_sale_at IS NULL')
            ->orderBy('open_sale_at', 'asc')
            ->orderBy('created_at', 'desc')
            ->limit($limit)
            ->get();

        return response()->json([
            'success' => true,
            'data' => $projects
        ], 200);
    }

    /**
     * Get project details by slug.
     */
    public function show($slug)
    {
        $query = Project::where('slug', $slug)
            ->with(['categories', 'seoMeta', 'developerRelation', 'locationRelation']);
        $user = request()->user('sanctum');
        $canViewUnpublished = $user && $user->hasAnyRole(['super_admin', 'admin', 'marketing']);

        if (!$canViewUnpublished) {
            $query->where('is_published', true);
        }

        $project = $query->first();

        if (!$project) {
            return response()->json([
                'success' => false,
                'message' => 'Project not found'
            ], 404);
        }

        // Get related projects in the same categories
        $categoryIds = $project->categories->pluck('id')->toArray();
        $relatedProjects = Project::where('id', '!=', $project->id)
            ->when(!$canViewUnpublished, fn($q) => $q->where('is_published', true))
            ->whereHas('categories', function($q) use ($categoryIds) {
                $q->whereIn('project_categories.id', $categoryIds);
            })
            ->limit(3)
            ->get();

        return response()->json([
            'success' => true,
            'data' => [
                'project' => $project,
                'related' => $relatedProjects
            ]
        ], 200);
    }

    /**
     * Get list of project categories.
     */
    public function categories()
    {
        $categories = ProjectCategory::withCount('projects')->get();

        return response()->json([
            'success' => true,
            'data' => $categories
        ], 200);
    }

    /**
     * Get project regions and their counts.
     */
    public function regions()
    {
        $regions = Project::select('region', DB::raw('count(*) as total'))
            ->whereNotNull('region')
            ->where('region', '!=', '')
            ->groupBy('region')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $regions
        ], 200);
    }

    /**
     * Create a new project (Admin/Marketing only).
     */
    public function store(Request $request)
    {
        $validator = \Illuminate\Support\Facades\Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'slug' => 'required|string|max:255|unique:projects',
            'code' => 'nullable|string|max:50',
            'developer_id' => 'nullable|integer|exists:developers,id',
            'location_id' => 'nullable|integer|exists:locations,id',
            'description' => 'nullable|string',
            'content' => 'nullable|string',
            'hero_subtitle' => 'nullable|string|max:255',
            'badge_text' => 'nullable|string|max:100',
            'location' => 'nullable|string',
            'region' => 'nullable|string',
            'address' => 'nullable|string',
            'province' => 'nullable|string',
            'district' => 'nullable|string',
            'ward' => 'nullable|string',
            'price_min' => 'nullable|numeric',
            'price_max' => 'nullable|numeric',
            'price_text' => 'nullable|string',
            'area_min' => 'nullable|numeric',
            'area_max' => 'nullable|numeric',
            'area_text' => 'nullable|string',
            'status' => 'required|string|in:upcoming,selling,completed',
            'sales_status' => 'nullable|string|in:coming_soon,selling,sold_out,handover',
            'open_sale_at' => 'nullable|date',
            'handover_year' => 'nullable|integer',
            'handover_time' => 'nullable|string',
            'legal_status' => 'nullable|string',
            'ownership_type' => 'nullable|string',
            'construction_density' => 'nullable|string',
            'total_area' => 'nullable|string',
            'total_units' => 'nullable|integer',
            'total_blocks' => 'nullable|integer',
            'total_floors' => 'nullable|integer',
            'highlight_points' => 'nullable|array',
            'quick_cards' => 'nullable|array',
            'project_facts' => 'nullable|array',
            'project_stats' => 'nullable|array',
            'nearby_places' => 'nullable|array',
            'connectivity' => 'nullable|array',
            'payment_policy' => 'nullable|string',
            'sales_policy' => 'nullable|string',
            'booking_policy' => 'nullable|string',
            'policy_cards' => 'nullable|array',
            'project_timeline' => 'nullable|array',
            'investment_reasons' => 'nullable|array',
            'project_testimonials' => 'nullable|array',
            'project_faqs' => 'nullable|array',
            'is_featured' => 'boolean',
            'is_hot' => 'boolean',
            'is_published' => 'boolean',
            'sort_order' => 'nullable|integer',
            'thumbnail' => 'nullable|string',
            'banner_image' => 'nullable|string',
            'gallery' => 'nullable|array',
            'gallery_label' => 'nullable|string|max:255',
            'gallery_title' => 'nullable|string|max:255',
            'gallery_description' => 'nullable|string',
            'brochure_url' => 'nullable|string',
            'video_url' => 'nullable|string',
            'virtual_tour_url' => 'nullable|string',
            'map_image_url' => 'nullable|string|max:255',
            'location_description' => 'nullable|string',
            'lat' => 'nullable|numeric',
            'lng' => 'nullable|numeric',
            'area_size' => 'nullable|string',
            'developer' => 'nullable|string',
            'scale' => 'nullable|string',
            'amenities' => 'nullable|array',
            'amenity_details' => 'nullable|array',
            'floor_tabs' => 'nullable|array',
            'floor_plans' => 'nullable|array',
            'price_rows' => 'nullable|array',
            'schema_price' => 'nullable|string|max:255',
            'schema_price_currency' => 'nullable|string|max:10',
            'schema_availability' => 'nullable|string|max:255',
            'category_ids' => 'nullable|array',
            'category_ids.*' => 'exists:project_categories,id',
            // SEO Meta
            'seo_title' => 'nullable|string|max:255',
            'seo_description' => 'nullable|string',
            'seo_keywords' => 'nullable|string|max:255',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Dữ liệu chưa hợp lệ. Vui lòng kiểm tra lại.',
                'errors' => $validator->errors()
            ], 422);
        }

        // Create project
        $project = Project::create($request->only([
            'name', 'slug', 'code', 'developer_id', 'location_id', 'description', 'content', 
            'hero_subtitle', 'badge_text', 'location', 'region', 'address', 'province', 'district', 'ward',
            'price_min', 'price_max', 'price_text', 'area_min', 'area_max', 'area_text',
            'status', 'sales_status', 'open_sale_at', 'handover_year', 'handover_time', 'legal_status', 
            'ownership_type', 'construction_density', 'total_area', 'total_units', 
            'total_blocks', 'total_floors', 'highlight_points', 'quick_cards', 'project_facts',
            'project_stats', 'nearby_places', 'connectivity', 'payment_policy', 'sales_policy',
            'booking_policy', 'policy_cards', 'project_timeline', 'investment_reasons',
            'project_testimonials', 'project_faqs', 'is_featured', 'is_hot',
            'is_published', 'sort_order', 'thumbnail', 'banner_image', 'gallery', 
            'gallery_label', 'gallery_title', 'gallery_description',
            'brochure_url', 'video_url', 'virtual_tour_url', 'map_image_url', 'location_description', 'lat', 'lng',
            'area_size', 'developer', 'scale', 'amenities', 'amenity_details', 'floor_tabs',
            'floor_plans', 'price_rows', 'schema_price', 'schema_price_currency', 'schema_availability'
        ]));

        // Sync categories
        if ($request->has('category_ids')) {
            $project->categories()->sync($request->category_ids);
        }

        // Create SEO Meta
        $project->seoMeta()->create([
            'title' => $request->get('seo_title', $project->name),
            'description' => $request->get('seo_description', $project->description),
            'keywords' => $request->get('seo_keywords'),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Đã tạo dự án thành công.',
            'data' => $project->load(['categories', 'seoMeta', 'developerRelation', 'locationRelation'])
        ], 201);
    }

    /**
     * Update an existing project (Admin/Marketing only).
     */
    public function update(Request $request, $id)
    {
        $project = Project::find($id);

        if (!$project) {
            return response()->json([
                'success' => false,
                'message' => 'Không tìm thấy dự án.'
            ], 404);
        }

        $validator = \Illuminate\Support\Facades\Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'slug' => 'required|string|max:255|unique:projects,slug,' . $id,
            'code' => 'nullable|string|max:50',
            'developer_id' => 'nullable|integer|exists:developers,id',
            'location_id' => 'nullable|integer|exists:locations,id',
            'description' => 'nullable|string',
            'content' => 'nullable|string',
            'hero_subtitle' => 'nullable|string|max:255',
            'badge_text' => 'nullable|string|max:100',
            'location' => 'nullable|string',
            'region' => 'nullable|string',
            'address' => 'nullable|string',
            'province' => 'nullable|string',
            'district' => 'nullable|string',
            'ward' => 'nullable|string',
            'price_min' => 'nullable|numeric',
            'price_max' => 'nullable|numeric',
            'price_text' => 'nullable|string',
            'area_min' => 'nullable|numeric',
            'area_max' => 'nullable|numeric',
            'area_text' => 'nullable|string',
            'status' => 'required|string|in:upcoming,selling,completed',
            'sales_status' => 'nullable|string|in:coming_soon,selling,sold_out,handover',
            'open_sale_at' => 'nullable|date',
            'handover_year' => 'nullable|integer',
            'handover_time' => 'nullable|string',
            'legal_status' => 'nullable|string',
            'ownership_type' => 'nullable|string',
            'construction_density' => 'nullable|string',
            'total_area' => 'nullable|string',
            'total_units' => 'nullable|integer',
            'total_blocks' => 'nullable|integer',
            'total_floors' => 'nullable|integer',
            'highlight_points' => 'nullable|array',
            'quick_cards' => 'nullable|array',
            'project_facts' => 'nullable|array',
            'project_stats' => 'nullable|array',
            'nearby_places' => 'nullable|array',
            'connectivity' => 'nullable|array',
            'payment_policy' => 'nullable|string',
            'sales_policy' => 'nullable|string',
            'booking_policy' => 'nullable|string',
            'policy_cards' => 'nullable|array',
            'project_timeline' => 'nullable|array',
            'investment_reasons' => 'nullable|array',
            'project_testimonials' => 'nullable|array',
            'project_faqs' => 'nullable|array',
            'is_featured' => 'boolean',
            'is_hot' => 'boolean',
            'is_published' => 'boolean',
            'sort_order' => 'nullable|integer',
            'thumbnail' => 'nullable|string',
            'banner_image' => 'nullable|string',
            'gallery' => 'nullable|array',
            'gallery_label' => 'nullable|string|max:255',
            'gallery_title' => 'nullable|string|max:255',
            'gallery_description' => 'nullable|string',
            'brochure_url' => 'nullable|string',
            'video_url' => 'nullable|string',
            'virtual_tour_url' => 'nullable|string',
            'map_image_url' => 'nullable|string|max:255',
            'location_description' => 'nullable|string',
            'lat' => 'nullable|numeric',
            'lng' => 'nullable|numeric',
            'area_size' => 'nullable|string',
            'developer' => 'nullable|string',
            'scale' => 'nullable|string',
            'amenities' => 'nullable|array',
            'amenity_details' => 'nullable|array',
            'floor_tabs' => 'nullable|array',
            'floor_plans' => 'nullable|array',
            'price_rows' => 'nullable|array',
            'schema_price' => 'nullable|string|max:255',
            'schema_price_currency' => 'nullable|string|max:10',
            'schema_availability' => 'nullable|string|max:255',
            'category_ids' => 'nullable|array',
            'category_ids.*' => 'exists:project_categories,id',
            // SEO Meta
            'seo_title' => 'nullable|string|max:255',
            'seo_description' => 'nullable|string',
            'seo_keywords' => 'nullable|string|max:255',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Dữ liệu chưa hợp lệ. Vui lòng kiểm tra lại.',
                'errors' => $validator->errors()
            ], 422);
        }

        $project->update($request->only([
            'name', 'slug', 'code', 'developer_id', 'location_id', 'description', 'content', 
            'hero_subtitle', 'badge_text', 'location', 'region', 'address', 'province', 'district', 'ward',
            'price_min', 'price_max', 'price_text', 'area_min', 'area_max', 'area_text',
            'status', 'sales_status', 'open_sale_at', 'handover_year', 'handover_time', 'legal_status', 
            'ownership_type', 'construction_density', 'total_area', 'total_units', 
            'total_blocks', 'total_floors', 'highlight_points', 'quick_cards', 'project_facts',
            'project_stats', 'nearby_places', 'connectivity', 'payment_policy', 'sales_policy',
            'booking_policy', 'policy_cards', 'project_timeline', 'investment_reasons',
            'project_testimonials', 'project_faqs', 'is_featured', 'is_hot',
            'is_published', 'sort_order', 'thumbnail', 'banner_image', 'gallery', 
            'gallery_label', 'gallery_title', 'gallery_description',
            'brochure_url', 'video_url', 'virtual_tour_url', 'map_image_url', 'location_description', 'lat', 'lng',
            'area_size', 'developer', 'scale', 'amenities', 'amenity_details', 'floor_tabs',
            'floor_plans', 'price_rows', 'schema_price', 'schema_price_currency', 'schema_availability'
        ]));

        // Sync categories
        if ($request->has('category_ids')) {
            $project->categories()->sync($request->category_ids);
        }

        // Update or create SEO Meta
        $project->seoMeta()->updateOrCreate(
            ['seoable_id' => $project->id, 'seoable_type' => Project::class],
            [
                'title' => $request->get('seo_title', $project->name),
                'description' => $request->get('seo_description', $project->description),
                'keywords' => $request->get('seo_keywords'),
            ]
        );

        return response()->json([
            'success' => true,
            'message' => 'Đã cập nhật dự án thành công.',
            'data' => $project->load(['categories', 'seoMeta', 'developerRelation', 'locationRelation'])
        ], 200);
    }

    /**
     * Delete a project.
     */
    public function destroy($id)
    {
        $project = Project::find($id);

        if (!$project) {
            return response()->json([
                'success' => false,
                'message' => 'Project not found'
            ], 404);
        }

        // Delete SEO meta first
        if ($project->seoMeta) {
            $project->seoMeta->delete();
        }

        // Detach categories
        $project->categories()->detach();

        // Delete project
        $project->delete();

        return response()->json([
            'success' => true,
            'message' => 'Project deleted successfully'
        ], 200);
    }

    /**
     * Create project category.
     */
    public function storeCategory(Request $request)
    {
        $validator = \Illuminate\Support\Facades\Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'slug' => 'required|string|max:255|unique:project_categories',
            'description' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        $category = ProjectCategory::create($request->only(['name', 'slug', 'description']));

        return response()->json([
            'success' => true,
            'message' => 'Category created successfully',
            'data' => $category
        ], 201);
    }

    /**
     * Update project category.
     */
    public function updateCategory(Request $request, $id)
    {
        $category = ProjectCategory::find($id);

        if (!$category) {
            return response()->json([
                'success' => false,
                'message' => 'Category not found'
            ], 404);
        }

        $validator = \Illuminate\Support\Facades\Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'slug' => 'required|string|max:255|unique:project_categories,slug,' . $id,
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
     * Delete project category.
     */
    public function destroyCategory($id)
    {
        $category = ProjectCategory::find($id);

        if (!$category) {
            return response()->json([
                'success' => false,
                'message' => 'Category not found'
            ], 404);
        }

        // Check if there are projects in this category
        if ($category->projects()->count() > 0) {
            return response()->json([
                'success' => false,
                'message' => 'Cannot delete category containing projects. Move projects first.'
            ], 400);
        }

        $category->delete();

        return response()->json([
            'success' => true,
            'message' => 'Category deleted successfully'
        ], 200);
    }

    /**
     * Toggle saving a project as favorite.
     */
    public function toggleSave(Request $request, $id)
    {
        $project = Project::find($id);

        if (!$project) {
            return response()->json([
                'success' => false,
                'message' => 'Project not found'
            ], 404);
        }

        $user = $request->user();
        $result = $user->savedProjects()->toggle($project->id);
        
        $saved = count($result['attached']) > 0;

        return response()->json([
            'success' => true,
            'message' => $saved ? 'Project saved successfully' : 'Project unsaved successfully',
            'data' => [
                'saved' => $saved
            ]
        ], 200);
    }
}
