<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Setting;
use App\Services\OpenAIService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Facades\Validator;

class AiSettingsController extends Controller
{
    protected OpenAIService $openai;

    public function __construct(OpenAIService $openai)
    {
        $this->openai = $openai;
    }

    public function index()
    {
        $contentConfig = $this->openai->getContentConfig();
        $imageConfig = $this->openai->getImageConfig();

        $contentApiKeyConfigured = !empty($contentConfig['api_key']);
        $imageApiKeyConfigured = !empty($imageConfig['api_key']);
        $contentApiKeyMasked = $contentApiKeyConfigured ? $this->maskApiKey($contentConfig['api_key']) : null;
        $imageApiKeyMasked = $imageApiKeyConfigured ? $this->maskApiKey($imageConfig['api_key']) : null;

        $settings = [
            'ai_provider' => Setting::get('ai_provider', 'openai'),
            'api_key_configured' => $contentApiKeyConfigured,
            'api_key_masked' => $contentApiKeyMasked,
            'content_api_key_configured' => $contentApiKeyConfigured,
            'content_api_key_masked' => $contentApiKeyMasked,
            'image_api_key_configured' => $imageApiKeyConfigured,
            'image_api_key_masked' => $imageApiKeyMasked,
            'openai_base_url' => $contentConfig['base_url'],
            'openai_wire_api' => $contentConfig['wire_api'],
            'openai_model' => $contentConfig['model'],
            'openai_reasoning_effort' => $contentConfig['reasoning_effort'],
            'openai_max_tokens' => $contentConfig['max_tokens'],
            'openai_image_base_url' => $imageConfig['base_url'],
            'openai_image_model' => $imageConfig['model'],
            'openai_image_quality' => $imageConfig['quality'],
            'ai_text_model' => $contentConfig['model'],
            'ai_image_model' => $imageConfig['model'],
            'ai_enable_model_fallback' => filter_var(Setting::get('ai_enable_model_fallback', false), FILTER_VALIDATE_BOOLEAN),
            'ai_fallback_text_model' => Setting::get('ai_fallback_text_model', 'gpt-4o-mini'),
            'ai_fallback_image_model' => Setting::get('ai_fallback_image_model', 'dall-e-3'),
            'ai_default_language' => Setting::get('ai_default_language', 'vi'),
            'ai_default_tone' => Setting::get('ai_default_tone', 'Sang trọng, chuyên nghiệp, chuẩn SEO bất động sản'),
            'ai_default_article_length' => Setting::get('ai_default_article_length', '1200-1800 words'),
            'ai_default_image_size' => Setting::get('ai_default_image_size', '1536x1024'),
            'ai_default_image_quality' => Setting::get('ai_default_image_quality', $imageConfig['quality'] ?: 'medium'),
            'ai_enable_image_generation' => filter_var(Setting::get('ai_enable_image_generation', true), FILTER_VALIDATE_BOOLEAN),
            'ai_max_articles_per_batch' => (int) Setting::get('ai_max_articles_per_batch', 20),
            'ai_max_jobs_per_hour' => (int) Setting::get('ai_max_jobs_per_hour', 30),
            'ai_default_author_id' => Setting::get('ai_default_author_id') ? (int) Setting::get('ai_default_author_id') : null,
            'ai_default_category_id' => Setting::get('ai_default_category_id') ? (int) Setting::get('ai_default_category_id') : null,
            'ai_default_post_status' => Setting::get('ai_default_post_status', 'draft'),
            'ai_schedule_timezone' => Setting::get('ai_schedule_timezone', 'Asia/Ho_Chi_Minh'),
            'last_scheduler_run_at' => Setting::get('last_scheduler_run_at'),
        ];

        return response()->json([
            'success' => true,
            'data' => $settings,
        ]);
    }

    public function update(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'ai_provider' => 'required|string|in:openai',
            'openai_api_key' => 'nullable|string',
            'clear_openai_api_key' => 'nullable|boolean',
            'openai_base_url' => 'required|url|starts_with:https://|max:255',
            'openai_wire_api' => 'required|string|in:chat_completions,responses',
            'openai_model' => 'required|string|max:255',
            'openai_reasoning_effort' => 'required|string|in:minimal,low,medium,high',
            'openai_max_tokens' => 'required|integer|min:1|max:128000',
            'openai_image_api_key' => 'nullable|string',
            'clear_openai_image_api_key' => 'nullable|boolean',
            'openai_image_base_url' => 'required|url|starts_with:https://|max:255',
            'openai_image_model' => 'required|string|max:255',
            'openai_image_quality' => 'required|string|in:low,medium,high,auto,standard,hd',
            'ai_openai_api_key' => 'nullable|string',
            'clear_ai_openai_api_key' => 'nullable|boolean',
            'ai_text_model' => 'nullable|string|max:255',
            'ai_image_model' => 'nullable|string|max:255',
            'ai_enable_model_fallback' => 'required|boolean',
            'ai_fallback_text_model' => 'nullable|string|max:255',
            'ai_fallback_image_model' => 'nullable|string|max:255',
            'ai_default_language' => 'required|string|max:10',
            'ai_default_tone' => 'required|string|max:255',
            'ai_default_article_length' => 'required|string|max:50',
            'ai_default_image_size' => 'required|string|max:20',
            'ai_default_image_quality' => 'required|string|max:20',
            'ai_enable_image_generation' => 'required|boolean',
            'ai_max_articles_per_batch' => 'required|integer|min:1|max:50',
            'ai_max_jobs_per_hour' => 'required|integer|min:1|max:100',
            'ai_default_author_id' => 'nullable|integer|exists:users,id',
            'ai_default_category_id' => 'nullable|integer|exists:post_categories,id',
            'ai_default_post_status' => 'required|string|in:draft',
            'ai_schedule_timezone' => 'required|string|max:50',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => $validator->errors()->first() ?: 'Dữ liệu cấu hình AI chưa hợp lệ.',
                'errors' => $validator->errors(),
            ], 422);
        }

        $contentApiKeyInput = $request->openai_api_key ?: $request->ai_openai_api_key;
        if ($request->boolean('clear_openai_api_key') || $request->boolean('clear_ai_openai_api_key')) {
            Setting::set('openai_api_key', '', 'string');
        } elseif ($this->isPlainApiKeyInput($contentApiKeyInput)) {
            Setting::set('openai_api_key', Crypt::encryptString($contentApiKeyInput), 'string');
        }

        $imageApiKeyInput = $request->openai_image_api_key;
        if ($request->boolean('clear_openai_image_api_key')) {
            Setting::set('openai_image_api_key', '', 'string');
        } elseif ($this->isPlainApiKeyInput($imageApiKeyInput)) {
            Setting::set('openai_image_api_key', Crypt::encryptString($imageApiKeyInput), 'string');
        }

        $contentModel = $request->openai_model ?: $request->ai_text_model;
        $imageModel = $request->openai_image_model ?: $request->ai_image_model;
        $imageQuality = $request->openai_image_quality ?: $request->ai_default_image_quality;

        Setting::set('ai_provider', $request->ai_provider, 'string');
        Setting::set('openai_base_url', rtrim($request->openai_base_url, '/'), 'string');
        Setting::set('openai_wire_api', $request->openai_wire_api, 'string');
        Setting::set('openai_model', $contentModel, 'string');
        Setting::set('openai_reasoning_effort', $request->openai_reasoning_effort, 'string');
        Setting::set('openai_max_tokens', $request->openai_max_tokens, 'number');
        Setting::set('openai_image_base_url', rtrim($request->openai_image_base_url, '/'), 'string');
        Setting::set('openai_image_model', $imageModel, 'string');
        Setting::set('openai_image_quality', $imageQuality, 'string');
        Setting::set('ai_text_model', $contentModel, 'string');
        Setting::set('ai_image_model', $imageModel, 'string');
        Setting::set('ai_enable_model_fallback', $request->ai_enable_model_fallback ? '1' : '0', 'boolean');
        Setting::set('ai_fallback_text_model', $request->ai_fallback_text_model ?: '', 'string');
        Setting::set('ai_fallback_image_model', $request->ai_fallback_image_model ?: '', 'string');
        Setting::set('ai_default_language', $request->ai_default_language, 'string');
        Setting::set('ai_default_tone', $request->ai_default_tone, 'string');
        Setting::set('ai_default_article_length', $request->ai_default_article_length, 'string');
        Setting::set('ai_default_image_size', $request->ai_default_image_size, 'string');
        Setting::set('ai_default_image_quality', $request->ai_default_image_quality ?: $imageQuality, 'string');
        Setting::set('ai_enable_image_generation', $request->ai_enable_image_generation ? '1' : '0', 'boolean');
        Setting::set('ai_max_articles_per_batch', $request->ai_max_articles_per_batch, 'number');
        Setting::set('ai_max_jobs_per_hour', $request->ai_max_jobs_per_hour, 'number');

        if ($request->has('ai_default_author_id')) {
            Setting::set('ai_default_author_id', $request->ai_default_author_id, 'number');
        }
        if ($request->has('ai_default_category_id')) {
            Setting::set('ai_default_category_id', $request->ai_default_category_id, 'number');
        }

        Setting::set('ai_default_post_status', $request->ai_default_post_status, 'string');
        Setting::set('ai_schedule_timezone', $request->ai_schedule_timezone, 'string');

        return response()->json([
            'success' => true,
            'message' => 'Đã lưu cấu hình AI thành công.',
        ]);
    }

    public function testConnection(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'openai_api_key' => 'nullable|string',
            'openai_base_url' => 'nullable|url|starts_with:https://|max:255',
            'openai_wire_api' => 'nullable|string|in:chat_completions,responses',
            'openai_model' => 'nullable|string|max:255',
            'openai_reasoning_effort' => 'nullable|string|in:minimal,low,medium,high',
            'openai_max_tokens' => 'nullable|integer|min:1|max:128000',
            'ai_openai_api_key' => 'nullable|string',
            'ai_text_model' => 'nullable|string|max:255',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => $validator->errors()->first() ?: 'Dữ liệu kiểm tra kết nối chưa hợp lệ.',
                'errors' => $validator->errors(),
            ], 422);
        }

        $apiKeyInput = $request->openai_api_key ?: $request->ai_openai_api_key;
        $apiKeyToTest = $this->isPlainApiKeyInput($apiKeyInput) ? $apiKeyInput : null;

        $result = $this->openai->testConnection($apiKeyToTest, $request->openai_model ?: $request->ai_text_model, [
            'openai_base_url' => $request->openai_base_url,
            'openai_wire_api' => $request->openai_wire_api,
            'openai_reasoning_effort' => $request->openai_reasoning_effort,
            'openai_max_tokens' => $request->openai_max_tokens,
        ]);

        if ($result['success']) {
            return response()->json([
                'success' => true,
                'message' => $result['message'],
            ]);
        }

        return response()->json([
            'success' => false,
            'message' => $result['message'],
            'details' => $result['details'] ?? null,
        ], 400);
    }

    protected function maskApiKey(string $apiKey): string
    {
        $len = strlen($apiKey);

        return $len > 8
            ? substr($apiKey, 0, 3) . '••••' . substr($apiKey, -4)
            : '••••';
    }

    protected function isPlainApiKeyInput($value): bool
    {
        if (!is_string($value) || trim($value) === '') {
            return false;
        }

        return !str_contains($value, '••••')
            && !str_contains($value, 'â€¢â€¢â€¢â€¢')
            && !str_contains($value, '????');
    }
}
