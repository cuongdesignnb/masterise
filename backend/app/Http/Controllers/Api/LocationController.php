<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Location;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class LocationController extends Controller
{
    /**
     * Get list of locations with optional filtering and pagination.
     */
    public function index(Request $request)
    {
        $query = Location::query()
            ->with('region:id,name,slug,is_active')
            ->withCount('projects');

        // Filter by search query
        if ($request->has('q') && !empty($request->q)) {
            $search = $request->q;
            $query->where(function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('province', 'like', "%{$search}%")
                  ->orWhere('district', 'like', "%{$search}%")
                  ->orWhere('address', 'like', "%{$search}%")
                  ->orWhereHas('region', fn ($regionQuery) => $regionQuery->where('name', 'like', "%{$search}%"));
            });
        }

        // Filter by province/district
        if ($request->has('province') && !empty($request->province)) {
            $query->where('province', $request->province);
        }
        if ($request->has('district') && !empty($request->district)) {
            $query->where('district', $request->district);
        }

        if ($request->filled('region_id')) {
            $query->where('region_id', $request->integer('region_id'));
        }

        if ($request->filled('region')) {
            $region = trim((string) $request->region);
            $query->whereHas('region', function ($regionQuery) use ($region) {
                $regionQuery->where('slug', $region)->orWhere('name', $region);
            });
        }

        // If 'all' is passed, bypass pagination
        if ($request->get('all') == 'true') {
            $locations = $query->orderBy('name', 'asc')->get();
            return response()->json([
                'success' => true,
                'data' => $locations
            ], 200);
        }

        $perPage = $request->get('per_page', 15);
        $locations = $query->orderBy('created_at', 'desc')->paginate($perPage);

        return response()->json([
            'success' => true,
            'data' => $locations->items(),
            'meta' => [
                'current_page' => $locations->currentPage(),
                'last_page' => $locations->lastPage(),
                'per_page' => $locations->perPage(),
                'total' => $locations->total(),
            ]
        ], 200);
    }

    /**
     * Store a newly created location in database.
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'region_id' => [
                'required',
                'integer',
                Rule::exists('regions', 'id')->where(fn ($query) => $query->where('is_active', true)),
            ],
            'name' => 'required|string|max:255',
            'slug' => 'nullable|string|max:255|unique:locations,slug',
            'province' => 'nullable|string|max:255',
            'district' => 'nullable|string|max:255',
            'ward' => 'nullable|string|max:255',
            'address' => 'nullable|string|max:255',
            'latitude' => 'nullable|numeric|between:-90,90',
            'longitude' => 'nullable|numeric|between:-180,180',
            'description' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        $data = $request->only([
            'region_id', 'name', 'province', 'district', 'ward', 'address', 'latitude', 'longitude', 'description'
        ]);

        $data['slug'] = $request->get('slug') ?: Str::slug($request->name);

        // Ensure slug uniqueness
        $originalSlug = $data['slug'];
        $count = 1;
        while (Location::where('slug', $data['slug'])->exists()) {
            $data['slug'] = $originalSlug . '-' . $count++;
        }

        $location = Location::create($data)->load('region:id,name,slug,is_active');

        return response()->json([
            'success' => true,
            'message' => 'Location created successfully',
            'data' => $location
        ], 201);
    }

    /**
     * Display the specified location details.
     */
    public function show($id)
    {
        $location = Location::with('region:id,name,slug,is_active')->withCount('projects')
            ->where('id', $id)
            ->orWhere('slug', $id)
            ->first();

        if (!$location) {
            return response()->json([
                'success' => false,
                'message' => 'Location not found'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $location
        ], 200);
    }

    /**
     * Update the specified location in database.
     */
    public function update(Request $request, $id)
    {
        $location = Location::find($id);

        if (!$location) {
            return response()->json([
                'success' => false,
                'message' => 'Location not found'
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'region_id' => [
                'required',
                'integer',
                Rule::exists('regions', 'id')->where(fn ($query) => $query->where('is_active', true)),
            ],
            'name' => 'required|string|max:255',
            'slug' => 'nullable|string|max:255|unique:locations,slug,' . $id,
            'province' => 'nullable|string|max:255',
            'district' => 'nullable|string|max:255',
            'ward' => 'nullable|string|max:255',
            'address' => 'nullable|string|max:255',
            'latitude' => 'nullable|numeric|between:-90,90',
            'longitude' => 'nullable|numeric|between:-180,180',
            'description' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        $data = $request->only([
            'region_id', 'name', 'province', 'district', 'ward', 'address', 'latitude', 'longitude', 'description'
        ]);

        if ($request->has('slug')) {
            $data['slug'] = $request->slug ?: Str::slug($request->name);
        }

        $location->update($data);

        if ($location->wasChanged('region_id')) {
            $regionName = $location->region()->value('name');
            $location->projects()->update(['region' => $regionName]);
        }

        return response()->json([
            'success' => true,
            'message' => 'Location updated successfully',
            'data' => $location->fresh()->load('region:id,name,slug,is_active')->loadCount('projects')
        ], 200);
    }

    /**
     * Remove the specified location from database.
     */
    public function destroy($id)
    {
        $location = Location::find($id);

        if (!$location) {
            return response()->json([
                'success' => false,
                'message' => 'Location not found'
            ], 404);
        }

        // Safety check: if location has projects, don't allow deletion
        if ($location->projects()->count() > 0) {
            return response()->json([
                'success' => false,
                'message' => 'Cannot delete location with associated projects. Please move or delete projects first.'
            ], 400);
        }

        $location->delete();

        return response()->json([
            'success' => true,
            'message' => 'Location deleted successfully'
        ], 200);
    }
}
