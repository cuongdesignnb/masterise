<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Developer;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;

class DeveloperController extends Controller
{
    /**
     * Get list of developers with optional filtering and pagination.
     */
    public function index(Request $request)
    {
        $query = Developer::query();

        // Filter by search query
        if ($request->has('q') && !empty($request->q)) {
            $search = $request->q;
            $query->where(function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%")
                  ->orWhere('address', 'like', "%{$search}%");
            });
        }

        // Filter by status (active/inactive)
        if ($request->has('is_active')) {
            $isActive = filter_var($request->is_active, FILTER_VALIDATE_BOOLEAN);
            $query->where('is_active', $isActive);
        }

        // If 'all' is passed, bypass pagination (useful for select dropdowns)
        if ($request->get('all') == 'true') {
            $developers = $query->orderBy('name', 'asc')->get();
            return response()->json([
                'success' => true,
                'data' => $developers
            ], 200);
        }

        $perPage = $request->get('per_page', 15);
        $developers = $query->orderBy('created_at', 'desc')->paginate($perPage);

        return response()->json([
            'success' => true,
            'data' => $developers->items(),
            'meta' => [
                'current_page' => $developers->currentPage(),
                'last_page' => $developers->lastPage(),
                'per_page' => $developers->perPage(),
                'total' => $developers->total(),
            ]
        ], 200);
    }

    /**
     * Store a newly created developer in database.
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'slug' => 'nullable|string|max:255|unique:developers,slug',
            'logo' => 'nullable|string|max:255',
            'description' => 'nullable|string',
            'website' => 'nullable|string|url|max:255',
            'hotline' => 'nullable|string|max:50',
            'email' => 'nullable|string|email|max:255',
            'address' => 'nullable|string|max:255',
            'is_active' => 'boolean',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        $data = $request->only([
            'name', 'logo', 'description', 'website', 'hotline', 'email', 'address'
        ]);
        
        $data['slug'] = $request->get('slug') ?: Str::slug($request->name);
        $data['is_active'] = $request->get('is_active', true);

        // Ensure slug uniqueness
        $originalSlug = $data['slug'];
        $count = 1;
        while (Developer::where('slug', $data['slug'])->exists()) {
            $data['slug'] = $originalSlug . '-' . $count++;
        }

        $developer = Developer::create($data);

        return response()->json([
            'success' => true,
            'message' => 'Developer created successfully',
            'data' => $developer
        ], 201);
    }

    /**
     * Display the specified developer details.
     */
    public function show($id)
    {
        $developer = Developer::withCount('projects')
            ->where('id', $id)
            ->orWhere('slug', $id)
            ->first();

        if (!$developer) {
            return response()->json([
                'success' => false,
                'message' => 'Developer not found'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $developer
        ], 200);
    }

    /**
     * Update the specified developer in database.
     */
    public function update(Request $request, $id)
    {
        $developer = Developer::find($id);

        if (!$developer) {
            return response()->json([
                'success' => false,
                'message' => 'Developer not found'
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'slug' => 'nullable|string|max:255|unique:developers,slug,' . $id,
            'logo' => 'nullable|string|max:255',
            'description' => 'nullable|string',
            'website' => 'nullable|string|url|max:255',
            'hotline' => 'nullable|string|max:50',
            'email' => 'nullable|string|email|max:255',
            'address' => 'nullable|string|max:255',
            'is_active' => 'boolean',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        $data = $request->only([
            'name', 'logo', 'description', 'website', 'hotline', 'email', 'address'
        ]);
        
        if ($request->has('slug')) {
            $data['slug'] = $request->slug ?: Str::slug($request->name);
        }
        
        if ($request->has('is_active')) {
            $data['is_active'] = filter_var($request->is_active, FILTER_VALIDATE_BOOLEAN);
        }

        $developer->update($data);

        return response()->json([
            'success' => true,
            'message' => 'Developer updated successfully',
            'data' => $developer
        ], 200);
    }

    /**
     * Remove the specified developer from database.
     */
    public function destroy($id)
    {
        $developer = Developer::find($id);

        if (!$developer) {
            return response()->json([
                'success' => false,
                'message' => 'Developer not found'
            ], 404);
        }

        // Safety check: if developer has projects, don't allow deletion
        if ($developer->projects()->count() > 0) {
            return response()->json([
                'success' => false,
                'message' => 'Cannot delete developer with associated projects. Please move or delete projects first.'
            ], 400);
        }

        $developer->delete();

        return response()->json([
            'success' => true,
            'message' => 'Developer deleted successfully'
        ], 200);
    }
}
