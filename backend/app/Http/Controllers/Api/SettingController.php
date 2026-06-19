<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Setting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class SettingController extends Controller
{
    /**
     * Get public settings.
     */
    public function publicSettings()
    {
        $keys = ['company_name', 'company_address', 'hotline', 'email', 'social_links', 'homepage_meta', 'logo_url', 'about_mission', 'about_vision', 'about_timeline', 'contact_departments', 'projects_page_hero', 'projects_page_cta', 'news_page_hero', 'news_page_cta'];
        $settings = [];

        foreach ($keys as $key) {
            $settings[$key] = Setting::get($key);
        }

        return response()->json([
            'success' => true,
            'data' => $settings
        ], 200);
    }

    /**
     * Get all settings (Admin only).
     */
    public function index()
    {
        $settings = Setting::all();

        return response()->json([
            'success' => true,
            'data' => $settings
        ], 200);
    }

    /**
     * Bulk update settings (Admin only).
     */
    public function update(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'settings' => 'required|array',
            'settings.*.key' => 'required|string',
            'settings.*.value' => 'present',
            'settings.*.type' => 'required|string|in:string,boolean,json,number',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        foreach ($request->settings as $item) {
            Setting::set($item['key'], $item['value'], $item['type']);
        }

        return response()->json([
            'success' => true,
            'message' => 'Settings updated successfully'
        ], 200);
    }
}
