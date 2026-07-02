<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\HeroBanner;
use Illuminate\Http\Request;

class HeroBannerController extends Controller
{
    /**
     * Get list of active hero banners ordered by sort_order.
     */
    public function index(Request $request)
    {
        $banners = HeroBanner::where('is_active', true)
            ->orderBy('sort_order')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $banners
        ], 200);
    }

    /**
     * Get all hero banners for admin management.
     */
    public function adminIndex()
    {
        $banners = HeroBanner::orderBy('sort_order')->get();

        return response()->json([
            'success' => true,
            'data' => $banners
        ], 200);
    }

    /**
     * Create a new hero banner (Admin only).
     */
    public function store(Request $request)
    {
        $validator = \Illuminate\Support\Facades\Validator::make($request->all(), [
            'title_lines' => 'required|array',
            'title_lines.*' => 'required|string',
            'highlight' => 'required|string|max:255',
            'description' => 'required|string',
            'image' => 'required|string',
            'sort_order' => 'integer',
            'is_active' => 'boolean',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        $banner = HeroBanner::create($request->only([
            'title_lines', 'highlight', 'description', 'image', 'sort_order', 'is_active'
        ]));

        return response()->json([
            'success' => true,
            'message' => 'Hero banner created successfully',
            'data' => $banner
        ], 201);
    }

    /**
     * Update an existing hero banner.
     */
    public function update(Request $request, $id)
    {
        $banner = HeroBanner::find($id);

        if (!$banner) {
            return response()->json([
                'success' => false,
                'message' => 'Hero banner not found'
            ], 404);
        }

        $validator = \Illuminate\Support\Facades\Validator::make($request->all(), [
            'title_lines' => 'required|array',
            'title_lines.*' => 'required|string',
            'highlight' => 'required|string|max:255',
            'description' => 'required|string',
            'image' => 'required|string',
            'sort_order' => 'integer',
            'is_active' => 'boolean',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        $banner->update($request->only([
            'title_lines', 'highlight', 'description', 'image', 'sort_order', 'is_active'
        ]));

        return response()->json([
            'success' => true,
            'message' => 'Hero banner updated successfully',
            'data' => $banner
        ], 200);
    }

    /**
     * Delete a hero banner.
     */
    public function destroy($id)
    {
        $banner = HeroBanner::find($id);

        if (!$banner) {
            return response()->json([
                'success' => false,
                'message' => 'Hero banner not found'
            ], 404);
        }

        $banner->delete();

        return response()->json([
            'success' => true,
            'message' => 'Hero banner deleted successfully'
        ], 200);
    }
}
