<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Faq;
use App\Support\NextCacheRevalidator;
use Illuminate\Http\Request;

class FaqController extends Controller
{
    /**
     * Get list of active FAQs ordered by sort_order.
     */
    public function index()
    {
        $faqs = Faq::where('is_active', true)
            ->orderBy('sort_order')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $faqs
        ], 200);
    }

    /**
     * Create a new FAQ (Admin only).
     */
    public function store(Request $request)
    {
        $validator = \Illuminate\Support\Facades\Validator::make($request->all(), [
            'question' => 'required|string|max:255',
            'answer' => 'required|string',
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

        $faq = Faq::create($request->only([
            'question', 'answer', 'sort_order', 'is_active'
        ]));
        NextCacheRevalidator::tags(['faqs']);

        return response()->json([
            'success' => true,
            'message' => 'FAQ created successfully',
            'data' => $faq
        ], 201);
    }

    /**
     * Update an existing FAQ.
     */
    public function update(Request $request, $id)
    {
        $faq = Faq::find($id);

        if (!$faq) {
            return response()->json([
                'success' => false,
                'message' => 'FAQ not found'
            ], 404);
        }

        $validator = \Illuminate\Support\Facades\Validator::make($request->all(), [
            'question' => 'required|string|max:255',
            'answer' => 'required|string',
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

        $faq->update($request->only([
            'question', 'answer', 'sort_order', 'is_active'
        ]));
        NextCacheRevalidator::tags(['faqs']);

        return response()->json([
            'success' => true,
            'message' => 'FAQ updated successfully',
            'data' => $faq
        ], 200);
    }

    /**
     * Delete a FAQ.
     */
    public function destroy($id)
    {
        $faq = Faq::find($id);

        if (!$faq) {
            return response()->json([
                'success' => false,
                'message' => 'FAQ not found'
            ], 404);
        }

        $faq->delete();
        NextCacheRevalidator::tags(['faqs']);

        return response()->json([
            'success' => true,
            'message' => 'FAQ deleted successfully'
        ], 200);
    }
}
