<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Helpers\AiContentHelper;
use App\Http\Resources\ProjectRelatedPostResource;
use App\Http\Resources\ProjectListResource;
use App\Models\Project;
use App\Models\ProjectCategory;
use App\Models\ProjectStatusDefinition;
use App\Models\Location;
use App\Models\Region;
use App\Support\ProjectPriceRange;
use App\Support\ProjectFloorPlanStructure;
use App\Support\ProjectStatus;
use App\Support\PublicContentCache;
use App\Support\PublicSlug;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class ProjectController extends Controller
{
    private function relatedPostValidationRules(): array
    {
        return [
            'related_post_ids' => ['nullable', 'array', 'max:3'],
            'related_post_ids.*' => [
                'integer',
                'distinct',
                Rule::exists('posts', 'id')->where(fn ($query) => $query
                    ->where('status', 'published')
                    ->whereIn('post_type', ['news', 'investment'])),
            ],
        ];
    }

    private function floorPlanValidationRules(): array
    {
        return [
            'floor_plan_groups' => 'nullable|array',
            'floor_plan_groups.*.key' => ['required', 'string', 'max:100', 'regex:/^[A-Za-z0-9_-]+$/', 'distinct'],
            'floor_plan_groups.*.label' => 'required|string|max:255',
            'floor_plan_groups.*.tabs' => 'required|array',
            'floor_plan_groups.*.tabs.*.key' => ['required', 'string', 'max:100', 'regex:/^[A-Za-z0-9_-]+$/', 'distinct'],
            'floor_plan_groups.*.tabs.*.label' => 'required|string|max:255',
            'floor_plan_groups.*.tabs.*.items' => 'required|array',
            'floor_plan_groups.*.tabs.*.items.*.key' => ['required', 'string', 'max:100', 'regex:/^[A-Za-z0-9_-]+$/', 'distinct'],
            'floor_plan_groups.*.tabs.*.items.*.productType' => 'nullable|string|max:255',
            'floor_plan_groups.*.tabs.*.items.*.name' => 'required|string|max:255',
            'floor_plan_groups.*.tabs.*.items.*.area' => 'nullable|string|max:255',
            'floor_plan_groups.*.tabs.*.items.*.totalArea' => 'nullable|string|max:255',
            'floor_plan_groups.*.tabs.*.items.*.description' => 'nullable|string',
            'floor_plan_groups.*.tabs.*.items.*.price' => 'nullable|string|max:255',
            'floor_plan_groups.*.tabs.*.items.*.bedrooms' => 'nullable|string|max:100',
            'floor_plan_groups.*.tabs.*.items.*.status' => 'nullable|string|max:100',
            'floor_plan_groups.*.tabs.*.items.*.images' => 'nullable|array',
            'floor_plan_groups.*.tabs.*.items.*.images.*' => [
                'string',
                'max:2048',
                function ($attribute, $value, $fail) {
                    $scheme = is_string($value) ? strtolower((string) parse_url($value, PHP_URL_SCHEME)) : '';
                    $isInternalPath = is_string($value) && Str::startsWith($value, '/');
                    $isHttpUrl = filter_var($value, FILTER_VALIDATE_URL) && in_array($scheme, ['http', 'https'], true);
                    if (!$isInternalPath && !$isHttpUrl) {
                        $fail('Ảnh mặt bằng phải là URL HTTP(S) hoặc đường dẫn nội bộ hợp lệ.');
                    }
                },
            ],
        ];
    }

    private function applyFloorPlanData(Request $request, array $projectData): array
    {
        if ($request->exists('floor_plan_groups')) {
            $groups = ProjectFloorPlanStructure::normalize($request->input('floor_plan_groups'));
        } elseif ($request->exists('floor_tabs') || $request->exists('floor_plans')) {
            $groups = ProjectFloorPlanStructure::fromLegacy(
                $request->input('floor_tabs', []),
                $request->input('floor_plans', [])
            );
        } else {
            return $projectData;
        }

        $projectData['floor_plan_groups'] = $groups;
        return array_merge($projectData, ProjectFloorPlanStructure::flatten($groups));
    }

    private function noStore($response)
    {
        return $response
            ->header('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0')
            ->header('Pragma', 'no-cache');
    }

    /**
     * Get list of projects with filtering and pagination.
     */
    public function index(Request $request)
    {
        $user = $request->user('sanctum');
        $canViewUnpublished = $user && $user->hasAnyRole(['super_admin', 'admin', 'marketing']);
        $query = $canViewUnpublished
            ? Project::query()->with(['categories', 'seoMeta', 'developerRelation', 'locationRelation.region'])
            : $this->publicListQuery();

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
            $this->applyRegionFilter($query, (string) $request->region, true);
        }

        if ($statusError = $this->applyProjectStatusFilter($query, $request)) {
            return $statusError;
        }

        if ($request->has('is_hot') && $request->is_hot !== '') {
            $query->where('is_hot', filter_var($request->is_hot, FILTER_VALIDATE_BOOLEAN));
        }

        // Filter by category slug
        if ($request->has('category') && !empty($request->category)) {
            $categorySlug = $request->category === 'shophouse-commercial'
                ? 'shophouse-thuong-mai'
                : $request->category;
            $query->whereHas('categories', function($q) use ($categorySlug) {
                $q->where('project_categories.slug', $categorySlug)
                    ->where('project_categories.taxonomy_type', ProjectCategory::TYPE_PROJECT);
            });
        }

        if ($priceRangeError = $this->applyPriceRangeFilter($query, $request)) {
            return $priceRangeError;
        }

        // Temporary compatibility for callers that still send the legacy numeric range.
        if (!$request->filled('price_range')) {
            if ($request->has('price_min')) {
                $query->where('price_max', '>=', $request->price_min);
            }
            if ($request->has('price_max')) {
                $query->where('price_min', '<=', $request->price_max);
            }
        }

        // Sorting
        $sortBy = $request->get('sort_by', 'created_at');
        $sortOrder = $request->get('sort_order', 'desc');

        if (in_array($sortBy, ['price_min', 'handover_year', 'open_sale_at', 'created_at', 'name', 'sort_order'])) {
            $this->applyProjectSort($query, $sortBy, $sortOrder);
        } else {
            $query->orderBy('created_at', 'desc');
        }

        $perPage = min($canViewUnpublished ? 100 : 50, max(1, $request->integer('per_page', 12)));
        $resolve = function () use ($query, $perPage, $request, $canViewUnpublished): array {
            $projects = $query->paginate($perPage);
            return [
                'success' => true,
                'data' => $canViewUnpublished
                    ? $projects->items()
                    : ProjectListResource::collection($projects->items())->resolve($request),
                'meta' => [
                    'current_page' => $projects->currentPage(),
                    'last_page' => $projects->lastPage(),
                    'per_page' => $projects->perPage(),
                    'total' => $projects->total(),
                ],
            ];
        };
        $payload = $canViewUnpublished
            ? $resolve()
            : PublicContentCache::remember('projects.list', $request->query(), 300, $resolve);
        $response = response()->json($payload, 200);

        $response = $this->markDeprecatedProjectStatusQuery($response, $request);

        return $canViewUnpublished
            ? $this->noStore($response)
            : $response->header('Cache-Control', 'public, max-age=60, s-maxage=300, stale-while-revalidate=60');
    }

    private function publicListQuery()
    {
        return Project::query()
            ->without('projectStatusDetail')
            ->select([
                'id', 'name', 'slug', 'description', 'project_label', 'location_id', 'location', 'address', 'region',
                'price_min', 'price_max', 'price_text', 'area_min', 'area_max', 'area_text', 'project_status',
                'open_sale_at', 'is_featured', 'is_hot', 'is_published', 'published_at', 'sort_order',
                'thumbnail', 'banner_image', 'created_at', 'updated_at',
            ])
            ->with([
                'categories:id,name,slug,taxonomy_type',
                'projectStatusDetail:id,name,slug,description,color_key,sort_order,is_active,is_default',
                'locationRelation:id,region_id,name,slug',
                'locationRelation.region:id,name,slug',
            ]);
    }

    public function regions()
    {
        $data = PublicContentCache::remember('projects.taxonomy', ['resource' => 'regions'], 900, fn () => Region::query()
            ->where('is_active', true)
            ->whereHas('projects', fn ($query) => $query->where('is_published', true))
            ->withCount([
                'projects as projects_count' => fn ($query) => $query->where('is_published', true),
            ])
            ->orderBy('sort_order')
            ->orderBy('name')
            ->get()
            ->map(fn (Region $region) => [
                'value' => $region->slug,
                'label' => $region->name,
                'projects_count' => (int) $region->projects_count,
            ])
            ->values()->all());

        return response()->json(['success' => true, 'data' => $data])
            ->header('Cache-Control', 'public, max-age=300, s-maxage=900');
    }

    public function adminIndex(Request $request)
    {
        $query = Project::query()->with(['categories', 'seoMeta', 'developerRelation', 'locationRelation.region']);

        if ($request->has('q') && !empty($request->q)) {
            $search = $request->q;
            $query->where(function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('location', 'like', "%{$search}%")
                  ->orWhere('developer', 'like', "%{$search}%");
            });
        }

        if ($request->has('region') && !empty($request->region)) {
            $this->applyRegionFilter($query, (string) $request->region, false);
        }

        if ($statusError = $this->applyProjectStatusFilter($query, $request)) {
            return $statusError;
        }

        if ($request->has('is_hot') && $request->is_hot !== '') {
            $query->where('is_hot', filter_var($request->is_hot, FILTER_VALIDATE_BOOLEAN));
        }

        if ($request->has('project_label') && !empty($request->project_label)) {
            $query->where('project_label', $request->project_label);
        }

        if ($request->has('category') && !empty($request->category)) {
            $categorySlug = $request->category;
            $query->whereHas('categories', function($q) use ($categorySlug) {
                $q->where('project_categories.slug', $categorySlug)
                    ->where('project_categories.taxonomy_type', ProjectCategory::TYPE_PROJECT);
            });
        }

        if ($priceRangeError = $this->applyPriceRangeFilter($query, $request)) {
            return $priceRangeError;
        }

        $sortBy = $request->get('sort_by', 'created_at');
        $sortOrder = $request->get('sort_order', 'desc');

        if (in_array($sortBy, ['price_min', 'handover_year', 'open_sale_at', 'created_at', 'name', 'sort_order'])) {
            $this->applyProjectSort($query, $sortBy, $sortOrder);
        } else {
            $query->orderBy('created_at', 'desc');
        }

        $perPage = $request->get('per_page', 10);
        $projects = $query->paginate($perPage);

        $response = response()->json([
            'success' => true,
            'data' => $projects->items(),
            'meta' => [
                'current_page' => $projects->currentPage(),
                'last_page' => $projects->lastPage(),
                'per_page' => $projects->perPage(),
                'total' => $projects->total(),
            ]
        ], 200);

        return $this->noStore($this->markDeprecatedProjectStatusQuery($response, $request));
    }

    /**
     * Get featured projects.
     */
    public function featured(Request $request)
    {
        $limit = min(8, max(1, $request->integer('limit', 6)));
        $projects = PublicContentCache::remember('projects.featured', ['limit' => $limit], 600, function () use ($limit, $request): array {
            $items = $this->publicListQuery()
                ->where('is_featured', true)
                ->where('is_published', true)
                ->orderBy('is_hot', 'desc')
                ->orderBy('sort_order', 'asc')
                ->orderByRaw('open_sale_at IS NULL')
                ->orderBy('open_sale_at', 'asc')
                ->orderBy('created_at', 'desc')
                ->limit($limit)
                ->get();

            return ProjectListResource::collection($items)->resolve($request);
        });

        return response()->json([
            'success' => true,
            'data' => $projects
        ], 200)->header('Cache-Control', 'public, max-age=60, s-maxage=600, stale-while-revalidate=60');
    }

    /**
     * Get project details by slug.
     */
    public function show($slug)
    {
        $query = Project::where('slug', $slug)
            ->with(['categories', 'seoMeta', 'developerRelation', 'locationRelation.region']);
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
            ->with('locationRelation.region')
            ->limit(3)
            ->get();

        $projectData = $project->toArray();
        $projectData['related_posts'] = ProjectRelatedPostResource::collection(
            $this->projectRelatedPosts($project, true)
        )->resolve(request());

        $response = response()->json([
            'success' => true,
            'data' => [
                'project' => $projectData,
                'related' => $relatedProjects
            ]
        ], 200);

        return $canViewUnpublished ? $this->noStore($response) : $response;
    }

    public function adminShow($id)
    {
        $project = Project::with(['categories', 'seoMeta', 'developerRelation', 'locationRelation.region'])->find($id);

        if (!$project) {
            return response()->json([
                'success' => false,
                'message' => 'Không tìm thấy dự án.'
            ], 404);
        }

        $projectData = $project->toArray();
        $projectData['related_posts'] = ProjectRelatedPostResource::collection(
            $this->projectRelatedPosts($project, false)
        )->resolve(request());

        return $this->noStore(response()->json([
            'success' => true,
            'data' => $projectData
        ], 200));
    }

    /**
     * Get list of project categories.
     */
    public function categories()
    {
        $categories = PublicContentCache::remember('projects.taxonomy', ['resource' => 'categories'], 900, fn () => ProjectCategory::query()
            ->where('taxonomy_type', ProjectCategory::TYPE_PROJECT)
            ->withCount([
                'projects as projects_count' => fn ($query) => $query->where('is_published', true),
            ])
            ->orderBy('name')
            ->get()
            ->filter(fn (ProjectCategory $category) => $category->projects_count > 0)
            ->values()->all());

        return response()->json([
            'success' => true,
            'data' => $categories
        ], 200)->header('Cache-Control', 'public, max-age=300, s-maxage=900');
    }

    public function options()
    {
        $data = PublicContentCache::remember('projects.options', [], 1800, fn () => Project::query()
            ->without('projectStatusDetail')
            ->where('is_published', true)
            ->orderByRaw('open_sale_at IS NULL')
            ->orderBy('open_sale_at')
            ->orderBy('name')
            ->get(['id', 'name', 'slug'])
            ->map(fn (Project $project) => [
                'id' => $project->id,
                'name' => $project->name,
                'slug' => $project->slug,
            ])->all());

        return response()->json(['success' => true, 'data' => $data])
            ->header('Cache-Control', 'public, max-age=300, s-maxage=1800, stale-while-revalidate=120');
    }

    public function adminCategories()
    {
        $categories = ProjectCategory::query()
            ->where('taxonomy_type', ProjectCategory::TYPE_PROJECT)
            ->withCount('projects')
            ->orderBy('name')
            ->get();

        return $this->noStore(response()->json([
            'success' => true,
            'data' => $categories,
        ], 200));
    }

    /**
     * Create a new project (Admin/Marketing only).
     */
    public function store(Request $request)
    {
        $requestedSlug = PublicSlug::normalize($request->input('slug') ?: $request->input('name'));
        $request->merge([
            'slug' => $request->boolean('slug_is_auto')
                ? PublicSlug::unique($requestedSlug)
                : $requestedSlug,
        ]);

        $validator = \Illuminate\Support\Facades\Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'slug' => ['required', 'string', 'max:255', 'regex:/^[a-z0-9]+(?:-[a-z0-9]+)*$/', 'unique:projects,slug', PublicSlug::rule()],
            'slug_is_auto' => 'sometimes|boolean',
            'code' => 'nullable|string|max:50',
            'developer_id' => 'nullable|integer|exists:developers,id',
            'location_id' => 'nullable|integer|exists:locations,id',
            'description' => 'nullable|string',
            'content' => 'nullable|string',
            'hero_subtitle' => 'nullable|string|max:255',
            'badge_text' => 'nullable|string|max:100',
            'project_label' => 'nullable|string|max:80',
            'location' => 'nullable|string',
            'address' => 'nullable|string',
            'province' => 'nullable|string',
            'district' => 'nullable|string',
            'ward' => 'nullable|string',
            'price_min' => 'nullable|numeric|min:0',
            'price_max' => [
                'nullable', 'numeric', 'min:0',
                function ($attribute, $value, $fail) use ($request) {
                    if ($request->filled('price_min') && (float) $value < (float) $request->input('price_min')) {
                        $fail('Giá cao nhất phải lớn hơn hoặc bằng giá khởi điểm.');
                    }
                },
            ],
            'price_per_sqm_min' => 'nullable|numeric|min:0',
            'price_per_sqm_max' => [
                'nullable', 'numeric', 'min:0',
                function ($attribute, $value, $fail) use ($request) {
                    if ($request->filled('price_per_sqm_min') && (float) $value < (float) $request->input('price_per_sqm_min')) {
                        $fail('Giá/m² cao nhất phải lớn hơn hoặc bằng giá/m² thấp nhất.');
                    }
                },
            ],
            'price_text' => 'nullable|string',
            'area_min' => 'nullable|numeric',
            'area_max' => 'nullable|numeric',
            'area_text' => 'nullable|string',
            'project_status' => [
                'required',
                Rule::exists('project_statuses', 'slug')->where(fn ($query) => $query->where('is_active', true)),
            ],
            'status' => 'prohibited',
            'sales_status' => 'prohibited',
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
            'detail_gallery' => 'nullable|array',
            'detail_gallery_label' => 'nullable|string|max:255',
            'detail_gallery_title' => 'nullable|string|max:255',
            'detail_gallery_description' => 'nullable|string',
            'section_titles' => 'nullable|array',
            'brochure_url' => 'nullable|string',
            'video_url' => 'nullable|string',
            'virtual_tour_url' => 'nullable|string',
            'map_image_url' => 'nullable|string',
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
            ...$this->floorPlanValidationRules(),
            'handover_standards' => 'nullable|array',
            'price_rows' => 'nullable|array',
            'schema_price' => 'nullable|string|max:255',
            'schema_price_currency' => 'nullable|string|max:10',
            'schema_availability' => 'nullable|string|max:255',
            'category_ids' => 'nullable|array',
            'category_ids.*' => [
                Rule::exists('project_categories', 'id')
                    ->where(fn ($query) => $query->where('taxonomy_type', ProjectCategory::TYPE_PROJECT)),
            ],
            ...$this->relatedPostValidationRules(),
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

        $location = $this->resolveLocation($request);
        if ($location instanceof \Illuminate\Http\JsonResponse) {
            return $location;
        }

        if ($request->boolean('is_published') && !$location) {
            return $this->invalidLocationResponse('Dự án phải có vị trí thuộc một vùng miền hợp lệ trước khi xuất bản.');
        }

        // Create project
        $projectData = $request->only([
            'name', 'slug', 'code', 'developer_id', 'location_id', 'description', 'content', 
            'hero_subtitle', 'badge_text', 'project_label', 'location', 'address', 'province', 'district', 'ward',
            'price_min', 'price_max', 'price_per_sqm_min', 'price_per_sqm_max', 'price_text',
            'area_min', 'area_max', 'area_text',
            'project_status', 'open_sale_at', 'handover_year', 'handover_time', 'legal_status',
            'ownership_type', 'construction_density', 'total_area', 'total_units', 
            'total_blocks', 'total_floors', 'highlight_points', 'quick_cards', 'project_facts',
            'project_stats', 'nearby_places', 'connectivity', 'payment_policy', 'sales_policy',
            'booking_policy', 'policy_cards', 'project_timeline', 'investment_reasons',
            'project_testimonials', 'project_faqs', 'is_featured', 'is_hot',
            'is_published', 'sort_order', 'thumbnail', 'banner_image', 'gallery', 
            'gallery_label', 'gallery_title', 'gallery_description', 'detail_gallery',
            'detail_gallery_label', 'detail_gallery_title', 'detail_gallery_description', 'section_titles',
            'brochure_url', 'video_url', 'virtual_tour_url', 'map_image_url', 'location_description', 'lat', 'lng',
            'area_size', 'developer', 'scale', 'amenities', 'amenity_details', 'floor_tabs',
            'floor_plans', 'floor_plan_groups', 'handover_standards', 'price_rows', 'schema_price', 'schema_price_currency', 'schema_availability'
        ]);
        $projectData = $this->applyFloorPlanData($request, $projectData);
        if (array_key_exists('content', $projectData) && filled($projectData['content'])) {
            $projectData['content'] = AiContentHelper::sanitizeHtml($projectData['content']);
        }
        $projectData = $this->normalizeProjectPriceData($projectData);
        $projectData['region'] = $location?->region?->name;
        $project = DB::transaction(function () use ($projectData, $request) {
            $project = Project::create($projectData);

            if ($request->has('category_ids')) {
                $project->categories()->sync($request->input('category_ids', []));
            }

            $this->syncProjectRelatedPosts($project, $request->input('related_post_ids', []));

            $project->seoMeta()->create([
                'title' => $request->get('seo_title', $project->name),
                'description' => $request->get('seo_description', $project->description),
                'keywords' => $request->get('seo_keywords'),
            ]);

            return $project;
        });

        PublicContentCache::invalidate('projects.list', 'projects.featured', 'projects.options', 'projects.taxonomy');

        $project->refresh();
        $project->load(['categories', 'seoMeta', 'developerRelation', 'locationRelation.region', 'projectStatusDetail']);
        $project->setAttribute('related_posts', ProjectRelatedPostResource::collection(
            $this->projectRelatedPosts($project, false)
        )->resolve($request));

        return $this->noStore(response()->json([
            'success' => true,
            'message' => 'Đã tạo dự án thành công.',
            'data' => $project
        ], 201));
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

        $request->merge([
            'slug' => PublicSlug::normalize($request->input('slug') ?: $request->input('name')),
        ]);

        $validator = \Illuminate\Support\Facades\Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'slug' => ['required', 'string', 'max:255', 'regex:/^[a-z0-9]+(?:-[a-z0-9]+)*$/', Rule::unique('projects', 'slug')->ignore($id), PublicSlug::rule('project', (int) $id)],
            'slug_is_auto' => 'sometimes|boolean',
            'code' => 'nullable|string|max:50',
            'developer_id' => 'nullable|integer|exists:developers,id',
            'location_id' => 'nullable|integer|exists:locations,id',
            'description' => 'nullable|string',
            'content' => 'nullable|string',
            'hero_subtitle' => 'nullable|string|max:255',
            'badge_text' => 'nullable|string|max:100',
            'project_label' => 'nullable|string|max:80',
            'location' => 'nullable|string',
            'address' => 'nullable|string',
            'province' => 'nullable|string',
            'district' => 'nullable|string',
            'ward' => 'nullable|string',
            'price_min' => 'nullable|numeric|min:0',
            'price_max' => [
                'nullable', 'numeric', 'min:0',
                function ($attribute, $value, $fail) use ($request) {
                    if ($request->filled('price_min') && (float) $value < (float) $request->input('price_min')) {
                        $fail('Giá cao nhất phải lớn hơn hoặc bằng giá khởi điểm.');
                    }
                },
            ],
            'price_per_sqm_min' => 'nullable|numeric|min:0',
            'price_per_sqm_max' => [
                'nullable', 'numeric', 'min:0',
                function ($attribute, $value, $fail) use ($request) {
                    if ($request->filled('price_per_sqm_min') && (float) $value < (float) $request->input('price_per_sqm_min')) {
                        $fail('Giá/m² cao nhất phải lớn hơn hoặc bằng giá/m² thấp nhất.');
                    }
                },
            ],
            'price_text' => 'nullable|string',
            'area_min' => 'nullable|numeric',
            'area_max' => 'nullable|numeric',
            'area_text' => 'nullable|string',
            'project_status' => [
                'required',
                Rule::exists('project_statuses', 'slug')->where(fn ($query) => $query->where('is_active', true)),
            ],
            'status' => 'prohibited',
            'sales_status' => 'prohibited',
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
            'detail_gallery' => 'nullable|array',
            'detail_gallery_label' => 'nullable|string|max:255',
            'detail_gallery_title' => 'nullable|string|max:255',
            'detail_gallery_description' => 'nullable|string',
            'section_titles' => 'nullable|array',
            'brochure_url' => 'nullable|string',
            'video_url' => 'nullable|string',
            'virtual_tour_url' => 'nullable|string',
            'map_image_url' => 'nullable|string',
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
            ...$this->floorPlanValidationRules(),
            'handover_standards' => 'nullable|array',
            'price_rows' => 'nullable|array',
            'schema_price' => 'nullable|string|max:255',
            'schema_price_currency' => 'nullable|string|max:10',
            'schema_availability' => 'nullable|string|max:255',
            'category_ids' => 'nullable|array',
            'category_ids.*' => [
                Rule::exists('project_categories', 'id')
                    ->where(fn ($query) => $query->where('taxonomy_type', ProjectCategory::TYPE_PROJECT)),
            ],
            ...$this->relatedPostValidationRules(),
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

        $location = $this->resolveLocation($request);
        if ($location instanceof \Illuminate\Http\JsonResponse) {
            return $location;
        }

        if ($request->boolean('is_published') && !$project->is_published && !$location) {
            return $this->invalidLocationResponse('Dự án phải có vị trí thuộc một vùng miền hợp lệ trước khi xuất bản.');
        }

        $projectData = $request->only([
            'name', 'slug', 'code', 'developer_id', 'location_id', 'description', 'content', 
            'hero_subtitle', 'badge_text', 'project_label', 'location', 'address', 'province', 'district', 'ward',
            'price_min', 'price_max', 'price_per_sqm_min', 'price_per_sqm_max', 'price_text',
            'area_min', 'area_max', 'area_text',
            'project_status', 'open_sale_at', 'handover_year', 'handover_time', 'legal_status',
            'ownership_type', 'construction_density', 'total_area', 'total_units', 
            'total_blocks', 'total_floors', 'highlight_points', 'quick_cards', 'project_facts',
            'project_stats', 'nearby_places', 'connectivity', 'payment_policy', 'sales_policy',
            'booking_policy', 'policy_cards', 'project_timeline', 'investment_reasons',
            'project_testimonials', 'project_faqs', 'is_featured', 'is_hot',
            'is_published', 'sort_order', 'thumbnail', 'banner_image', 'gallery', 
            'gallery_label', 'gallery_title', 'gallery_description', 'detail_gallery',
            'detail_gallery_label', 'detail_gallery_title', 'detail_gallery_description', 'section_titles',
            'brochure_url', 'video_url', 'virtual_tour_url', 'map_image_url', 'location_description', 'lat', 'lng',
            'area_size', 'developer', 'scale', 'amenities', 'amenity_details', 'floor_tabs',
            'floor_plans', 'floor_plan_groups', 'handover_standards', 'price_rows', 'schema_price', 'schema_price_currency', 'schema_availability'
        ]);
        $projectData = $this->applyFloorPlanData($request, $projectData);
        if (array_key_exists('content', $projectData) && filled($projectData['content'])) {
            $projectData['content'] = AiContentHelper::sanitizeHtml($projectData['content']);
        }
        $projectData = $this->normalizeProjectPriceData($projectData);
        if ($location) {
            $projectData['region'] = $location->region->name;
        } elseif ($project->location_id !== null || !$project->is_published) {
            $projectData['region'] = null;
        }
        DB::transaction(function () use ($project, $projectData, $request) {
            $project->update($projectData);

            if ($request->has('category_ids')) {
                $collectionCategoryIds = $project->categories()
                    ->where('taxonomy_type', ProjectCategory::TYPE_COLLECTION)
                    ->pluck('project_categories.id')
                    ->all();

                $project->categories()->sync(array_values(array_unique([
                    ...$collectionCategoryIds,
                    ...$request->input('category_ids', []),
                ])));
            }

            if ($request->has('related_post_ids')) {
                $this->syncProjectRelatedPosts($project, $request->input('related_post_ids', []));
            }

            $project->seoMeta()->updateOrCreate(
                ['seoable_id' => $project->id, 'seoable_type' => Project::class],
                [
                    'title' => $request->get('seo_title', $project->name),
                    'description' => $request->get('seo_description', $project->description),
                    'keywords' => $request->get('seo_keywords'),
                ]
            );
        });

        PublicContentCache::invalidate('projects.list', 'projects.featured', 'projects.options', 'projects.taxonomy');

        $project->refresh();
        $project->load(['categories', 'seoMeta', 'developerRelation', 'locationRelation.region', 'projectStatusDetail']);
        $project->setAttribute('related_posts', ProjectRelatedPostResource::collection(
            $this->projectRelatedPosts($project, false)
        )->resolve($request));

        return $this->noStore(response()->json([
            'success' => true,
            'message' => 'Đã cập nhật dự án thành công.',
            'data' => $project
        ], 200));
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
        $name = trim((string) $request->input('name'));
        $slug = Str::slug(trim((string) $request->input('slug')) ?: $name);
        $request->merge(['name' => $name, 'slug' => $slug]);

        $validator = \Illuminate\Support\Facades\Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'slug' => 'required|string|max:255|unique:project_categories',
            'description' => 'nullable|string',
        ]);

        $validator->after(function ($validator) use ($name) {
            $duplicate = ProjectCategory::query()
                ->where('taxonomy_type', ProjectCategory::TYPE_PROJECT)
                ->whereRaw('LOWER(name) = ?', [mb_strtolower($name)])
                ->exists();

            if ($duplicate) {
                $validator->errors()->add('name', 'Loại hình dự án đã tồn tại.');
            }
        });

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        $category = ProjectCategory::create([
            ...$request->only(['name', 'slug', 'description']),
            'taxonomy_type' => ProjectCategory::TYPE_PROJECT,
        ]);

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
        $category = ProjectCategory::query()
            ->where('taxonomy_type', ProjectCategory::TYPE_PROJECT)
            ->find($id);

        if (!$category) {
            return response()->json([
                'success' => false,
                'message' => 'Category not found'
            ], 404);
        }

        $name = trim((string) $request->input('name'));
        $slug = Str::slug(trim((string) $request->input('slug')) ?: $name);
        $request->merge(['name' => $name, 'slug' => $slug]);

        $validator = \Illuminate\Support\Facades\Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'slug' => 'required|string|max:255|unique:project_categories,slug,' . $id,
            'description' => 'nullable|string',
        ]);

        $validator->after(function ($validator) use ($name, $id) {
            $duplicate = ProjectCategory::query()
                ->where('taxonomy_type', ProjectCategory::TYPE_PROJECT)
                ->where('id', '!=', $id)
                ->whereRaw('LOWER(name) = ?', [mb_strtolower($name)])
                ->exists();

            if ($duplicate) {
                $validator->errors()->add('name', 'Loại hình dự án đã tồn tại.');
            }
        });

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
        $category = ProjectCategory::query()
            ->where('taxonomy_type', ProjectCategory::TYPE_PROJECT)
            ->find($id);

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

    private function applyPriceRangeFilter($query, Request $request): ?\Illuminate\Http\JsonResponse
    {
        if (!$request->filled('price_range')) {
            return null;
        }

        $range = (string) $request->input('price_range');
        if (!in_array($range, ProjectPriceRange::values(), true)) {
            return response()->json([
                'success' => false,
                'message' => 'Khoảng giá không hợp lệ.',
                'errors' => ['price_range' => ['Khoảng giá đã chọn không hợp lệ.']],
            ], 422);
        }

        ProjectPriceRange::apply($query, $range);

        return null;
    }

    private function applyProjectSort($query, string $sortBy, string $sortOrder): void
    {
        $direction = strtolower($sortOrder) === 'asc' ? 'asc' : 'desc';

        if ($sortBy === 'price_min') {
            $query->orderByRaw('price_min IS NULL')->orderBy('price_min', $direction);
            return;
        }

        $query->orderBy($sortBy, $direction);
    }

    private function projectRelatedPosts(Project $project, bool $publicOnly)
    {
        return $project->relatedPosts()
            ->select([
                'posts.id',
                'posts.title',
                'posts.slug',
                'posts.post_type',
                'posts.summary',
                'posts.thumbnail',
                'posts.post_category_id',
                'posts.published_at',
            ])
            ->with('category:id,name,slug')
            ->when($publicOnly, fn ($query) => $query
                ->where('posts.status', 'published')
                ->whereIn('posts.post_type', ['news', 'investment']))
            ->limit(3)
            ->get();
    }

    private function syncProjectRelatedPosts(Project $project, array $postIds): void
    {
        $sync = [];
        foreach (array_values(array_unique($postIds)) as $index => $postId) {
            $sync[(int) $postId] = ['sort_order' => $index];
        }

        $project->relatedPosts()->sync($sync);
    }

    private function normalizeProjectPriceData(array $projectData): array
    {
        $priceMin = $projectData['price_min'] ?? null;
        $priceText = trim((string) ($projectData['price_text'] ?? ''));

        if ($priceText === '' && $priceMin !== null && $priceMin !== '') {
            $projectData['price_text'] = ProjectPriceRange::displayText($priceMin);
        }

        return $projectData;
    }

    private function applyRegionFilter($query, string $value, bool $activeOnly): void
    {
        $value = trim($value);
        $region = Region::query()
            ->where(function ($builder) use ($value) {
                $builder->where('slug', $value)->orWhere('name', $value);
            })
            ->first();

        if ($region) {
            if ($activeOnly && !$region->is_active) {
                $query->whereRaw('1 = 0');
                return;
            }

            $query->whereHas('locationRelation.region', function ($regionFilter) use ($region, $activeOnly) {
                $regionFilter->whereKey($region->id);
                if ($activeOnly) {
                    $regionFilter->where('is_active', true);
                }
            });
            return;
        }

        $query->whereRaw('1 = 0');
    }

    /**
     * Apply the canonical project_status filter. Legacy query aliases are supported
     * temporarily for bookmarked URLs only; new clients must use project_status.
     */
    private function applyProjectStatusFilter($query, Request $request): ?\Illuminate\Http\JsonResponse
    {
        $source = collect(['project_status', 'sales_status', 'status'])
            ->first(fn (string $key) => $request->filled($key));

        if (!$source) {
            return null;
        }

        $rawValues = $request->input($source);
        $values = is_array($rawValues) ? $rawValues : explode(',', (string) $rawValues);
        $statuses = [];

        foreach ($values as $value) {
            $value = trim((string) $value);
            $mapped = match ($source) {
                'project_status' => ProjectStatusDefinition::query()->where('slug', $value)->exists() ? $value : null,
                'sales_status' => ProjectStatus::fromLegacySalesStatus($value),
                'status' => ProjectStatus::fromLegacyStatus($value),
            };

            if ($mapped !== null && !ProjectStatusDefinition::query()->where('slug', $mapped)->exists()) {
                $mapped = null;
            }

            if ($mapped === null) {
                return response()->json([
                    'success' => false,
                    'message' => 'Trạng thái dự án không hợp lệ.',
                    'errors' => [$source => ['Giá trị trạng thái dự án không hợp lệ: '.$value]],
                ], 422);
            }

            $statuses[] = $mapped;
        }

        $query->whereIn('project_status', array_values(array_unique($statuses)));

        if ($source !== 'project_status') {
            $request->attributes->set('deprecated_project_status_query', $source);
        }

        return null;
    }

    private function markDeprecatedProjectStatusQuery($response, Request $request)
    {
        $legacyQuery = $request->attributes->get('deprecated_project_status_query');
        if ($legacyQuery) {
            $response
                ->header('Deprecation', 'true')
                ->header('X-Deprecated-Query', $legacyQuery)
                ->header('Link', '</api/v1/projects?project_status=>; rel="successor-version"');
        }

        return $response;
    }

    private function resolveLocation(Request $request): Location|\Illuminate\Http\JsonResponse|null
    {
        if (!$request->filled('location_id')) {
            return null;
        }

        $location = Location::with('region')->find($request->integer('location_id'));
        if (!$location || !$location->region) {
            return $this->invalidLocationResponse('Vị trí đã chọn chưa được gán vùng miền. Hãy cập nhật trong Quản lý vị trí.');
        }

        if (!$location->region->is_active) {
            return $this->invalidLocationResponse('Vùng miền của vị trí đã bị vô hiệu hóa. Hãy chọn vị trí hợp lệ khác.');
        }

        return $location;
    }

    private function invalidLocationResponse(string $message): \Illuminate\Http\JsonResponse
    {
        return response()->json([
            'success' => false,
            'message' => $message,
            'errors' => ['location_id' => [$message]],
        ], 422);
    }
}
