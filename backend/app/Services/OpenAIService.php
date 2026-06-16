<?php

namespace App\Services;

use App\Models\Setting;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Facades\Log;

class OpenAIService
{
    protected string $provider = 'openai';

    /**
     * Get the decrypted API key from settings or env fallback.
     */
    public function getApiKey(): ?string
    {
        $encryptedKey = Setting::get('ai_openai_api_key');
        if ($encryptedKey) {
            try {
                return Crypt::decryptString($encryptedKey);
            } catch (\Exception $e) {
                Log::error('[OpenAIService] Failed to decrypt API key: ' . $e->getMessage());
            }
        }
        return env('OPENAI_API_KEY');
    }

    /**
     * Get setting value with env fallback.
     */
    protected function getSetting(string $key, $default = null)
    {
        $dbVal = Setting::get($key);
        if ($dbVal !== null) {
            return $dbVal;
        }

        // Convert key to env format, e.g. ai_text_model -> OPENAI_TEXT_MODEL
        $envKey = strtoupper(str_replace('ai_', 'OPENAI_', $key));
        return env($envKey, $default);
    }

    /**
     * Test OpenAI API connection with a given key or stored key.
     */
    public function testConnection(?string $apiKey = null): array
    {
        $key = $apiKey ?: $this->getApiKey();
        if (!$key) {
            return [
                'success' => false,
                'message' => 'API Key is not configured.'
            ];
        }

        $model = $this->getSetting('ai_text_model', 'gpt-5.4-mini');

        try {
            // Call chat completion with max_tokens = 1 to test key validity cheaply
            $response = Http::withHeaders([
                'Authorization' => 'Bearer ' . $key,
                'Content-Type' => 'application/json'
            ])->timeout(10)->post('https://api.openai.com/v1/chat/completions', [
                'model' => $model,
                'messages' => [
                    ['role' => 'user', 'content' => 'ping']
                ],
                'max_tokens' => 1
            ]);

            if ($response->successful()) {
                return [
                    'success' => true,
                    'message' => 'Connection successful!'
                ];
            }

            $error = $response->json();
            $errorMessage = $error['error']['message'] ?? 'Unknown API error.';
            $errorCode = $error['error']['code'] ?? null;

            // Handle specific model not found for test connection
            if ($response->status() === 404 && $errorCode === 'model_not_found') {
                return [
                    'success' => false,
                    'message' => "Model '{$model}' is not available for this API Key. Please verify model settings.",
                    'details' => $errorMessage
                ];
            }

            return [
                'success' => false,
                'message' => 'API returned error status ' . $response->status(),
                'details' => $errorMessage
            ];

        } catch (\Exception $e) {
            return [
                'success' => false,
                'message' => 'Failed to connect to OpenAI API: ' . $e->getMessage()
            ];
        }
    }

    /**
     * Generate article content using OpenAI Responses or Chat completions.
     */
    public function generateArticleWithResponsesApi(string $prompt, array $options = []): array
    {
        $key = $this->getApiKey();
        if (!$key) {
            throw new \Exception('OpenAI API Key is not configured.');
        }

        $model = $this->getSetting('ai_text_model', 'gpt-5.4-mini');
        $enableFallback = filter_var($this->getSetting('ai_enable_model_fallback', false), FILTER_VALIDATE_BOOLEAN);
        $fallbackModel = $this->getSetting('ai_fallback_text_model', 'gpt-4o-mini');

        return $this->executeTextRequest($prompt, $model, $key, $enableFallback, $fallbackModel, $options);
    }

    /**
     * Execute the HTTP request to OpenAI text endpoint.
     */
    protected function executeTextRequest(
        string $prompt,
        string $model,
        string $key,
        bool $enableFallback,
        ?string $fallbackModel,
        array $options = []
    ): array {
        try {
            // Note: We use chat/completions with JSON response format for structured text.
            // If OpenAI Responses API (newer) becomes standard, we call that endpoint, but fallback is supported.
            $response = Http::withHeaders([
                'Authorization' => 'Bearer ' . $key,
                'Content-Type' => 'application/json'
            ])->timeout(180)->post('https://api.openai.com/v1/chat/completions', [
                'model' => $model,
                'messages' => [
                    [
                        'role' => 'system',
                        'content' => 'You are a professional real estate SEO content writer. Always respond in JSON format matching the requested schema.'
                    ],
                    [
                        'role' => 'user',
                        'content' => $prompt
                    ]
                ],
                'response_format' => ['type' => 'json_object'],
                'temperature' => $options['temperature'] ?? 0.7,
            ]);

            if ($response->successful()) {
                return [
                    'success' => true,
                    'data' => $response->json(),
                    'model_used' => $model
                ];
            }

            $error = $response->json();
            $errorMessage = $error['error']['message'] ?? 'API request failed.';
            $errorCode = $error['error']['code'] ?? null;

            // Model not found check
            if ($response->status() === 404 && $errorCode === 'model_not_found') {
                if ($enableFallback && $fallbackModel && $model !== $fallbackModel) {
                    Log::warning("[OpenAIService] Model '{$model}' not found. Falling back to '{$fallbackModel}'.");
                    return $this->executeTextRequest($prompt, $fallbackModel, $key, false, null, $options);
                }

                throw new \Exception("Model AI hiện tại không khả dụng hoặc tài khoản chưa được cấp quyền sử dụng model này. Vui lòng kiểm tra lại model trong phần Cấu hình AI.");
            }

            throw new \Exception($errorMessage);

        } catch (\Exception $e) {
            Log::error('[OpenAIService] Text generation error: ' . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Generate an image using DALL-E/OpenAI Image endpoint.
     */
    public function generateImageWithImageApi(string $prompt, ?string $size = null, ?string $quality = null): string
    {
        $key = $this->getApiKey();
        if (!$key) {
            throw new \Exception('OpenAI API Key is not configured.');
        }

        $model = $this->getSetting('ai_image_model', 'gpt-image-2');
        $imgSize = $size ?: $this->getSetting('ai_default_image_size', '1024x1024');
        $imgQuality = $quality ?: $this->getSetting('ai_default_image_quality', 'standard');
        
        $enableFallback = filter_var($this->getSetting('ai_enable_model_fallback', false), FILTER_VALIDATE_BOOLEAN);
        $fallbackModel = $this->getSetting('ai_fallback_image_model', 'dall-e-3');

        return $this->executeImageRequest($prompt, $model, $imgSize, $imgQuality, $key, $enableFallback, $fallbackModel);
    }

    /**
     * Execute the HTTP request to OpenAI Image API.
     */
    protected function executeImageRequest(
        string $prompt,
        string $model,
        string $size,
        string $quality,
        string $key,
        bool $enableFallback,
        ?string $fallbackModel
    ): string {
        try {
            // Note: OpenAI DALL-E API endpoint
            $body = [
                'model' => $model,
                'prompt' => $prompt,
                'n' => 1,
                'size' => $size,
                'response_format' => 'b64_json'
            ];

            // DALL-E-3 supports quality parameter
            if (str_contains($model, 'dall-e-3') || str_contains($fallbackModel ?? '', 'dall-e-3')) {
                $body['quality'] = $quality;
            }

            $response = Http::withHeaders([
                'Authorization' => 'Bearer ' . $key,
                'Content-Type' => 'application/json'
            ])->timeout(180)->post('https://api.openai.com/v1/images/generations', $body);

            if ($response->successful()) {
                $b64Json = $response->json('data.0.b64_json');
                if (!$b64Json) {
                    throw new \Exception('No image data returned in API response.');
                }
                return $b64Json;
            }

            $error = $response->json();
            $errorMessage = $error['error']['message'] ?? 'Image generation request failed.';
            $errorCode = $error['error']['code'] ?? null;

            // Model not found check
            if ($response->status() === 404 && $errorCode === 'model_not_found') {
                if ($enableFallback && $fallbackModel && $model !== $fallbackModel) {
                    Log::warning("[OpenAIService] Image model '{$model}' not found. Falling back to '{$fallbackModel}'.");
                    return $this->executeImageRequest($prompt, $fallbackModel, $size, $quality, $key, false, null);
                }

                throw new \Exception("Model AI hiện tại không khả dụng hoặc tài khoản chưa được cấp quyền sử dụng model này. Vui lòng kiểm tra lại model trong phần Cấu hình AI.");
            }

            throw new \Exception($errorMessage);

        } catch (\Exception $e) {
            Log::error('[OpenAIService] Image generation error: ' . $e->getMessage());
            throw $e;
        }
    }
}
