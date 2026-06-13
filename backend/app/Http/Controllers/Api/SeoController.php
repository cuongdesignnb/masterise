<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\SeoMeta;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class SeoController extends Controller
{
    /**
     * Get SEO meta details by request path.
     */
    public function byPath(Request $request)
    {
        $path = $request->get('path', '/');
        
        // Clean path to remove leading/trailing slashes (except '/')
        if ($path !== '/') {
            $path = '/' . trim($path, '/');
        }

        $seo = SeoMeta::where('path', $path)->first();

        if (!$seo) {
            // Check if it matches a project page
            // path format: /du-an/the-global-city
            if (preg_match('#^/du-an/([^/]+)$#', $path, $matches)) {
                $slug = $matches[1];
                $project = \App\Models\Project::where('slug', $slug)->first();
                if ($project && $project->seoMeta) {
                    return response()->json([
                        'success' => true,
                        'data' => $project->seoMeta
                    ], 200);
                }
            }

            // Check if it matches a news page
            // path format: /tin-tuc/some-slug
            if (preg_match('#^/tin-tuc/([^/]+)$#', $path, $matches)) {
                $slug = $matches[1];
                $post = \App\Models\Post::where('slug', $slug)->first();
                if ($post && $post->seoMeta) {
                    return response()->json([
                        'success' => true,
                        'data' => $post->seoMeta
                    ], 200);
                }
            }

            // Fallback to homepage SEO or null
            $seo = SeoMeta::where('path', '/')->first();
        }

        return response()->json([
            'success' => true,
            'data' => $seo
        ], 200);
    }

    /**
     * Create or update static route SEO meta (Admin only).
     */
    public function update(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'path' => 'required|string',
            'title' => 'nullable|string|max:255',
            'description' => 'nullable|string',
            'keywords' => 'nullable|string|max:255',
            'og_title' => 'nullable|string|max:255',
            'og_description' => 'nullable|string',
            'og_image' => 'nullable|string|max:255',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        $path = $request->path;
        if ($path !== '/') {
            $path = '/' . trim($path, '/');
        }

        $seo = SeoMeta::updateOrCreate(
            ['path' => $path],
            $request->only(['title', 'description', 'keywords', 'og_title', 'og_description', 'og_image'])
        );

        return response()->json([
            'success' => true,
            'message' => 'SEO meta updated successfully',
            'data' => $seo
        ], 200);
    }
}
