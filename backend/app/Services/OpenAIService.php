<?php

namespace App\Services;

use App\Models\Setting;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Facades\Http;
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

        $envKey = strtoupper(str_replace('ai_', 'OPENAI_', $key));
        return env($envKey, $default);
    }

    protected function normalizeModelName(?string $model): string
    {
        return strtolower(trim((string) $model));
    }

    protected function isReasoningOrNewChatModel(?string $model): bool
    {
        $model = $this->normalizeModelName($model);

        return str_starts_with($model, 'gpt-5')
            || str_starts_with($model, 'o1')
            || str_starts_with($model, 'o3')
            || str_starts_with($model, 'o4')
            || str_contains($model, 'reasoning');
    }

    protected function shouldUseMaxCompletionTokens(?string $model): bool
    {
        return $this->isReasoningOrNewChatModel($model);
    }

    protected function supportsTemperature(?string $model): bool
    {
        return !$this->isReasoningOrNewChatModel($model);
    }

    protected function isGptImageModel(?string $model): bool
    {
        return str_starts_with($this->normalizeModelName($model), 'gpt-image');
    }

    protected function isDalleModel(?string $model): bool
    {
        return str_starts_with($this->normalizeModelName($model), 'dall-e');
    }

    protected function normalizeImageSize(string $model, ?string $size): string
    {
        $model = $this->normalizeModelName($model);
        $size = $size ?: '1024x1024';

        if ($this->isGptImageModel($model)) {
            $map = [
                '1024x1024' => '1024x1024',
                '1792x1024' => '1536x1024',
                '1024x1792' => '1024x1536',
                '1536x1024' => '1536x1024',
                '1024x1536' => '1024x1536',
                'auto' => 'auto',
            ];

            return $map[$size] ?? '1024x1024';
        }

        if ($model === 'dall-e-3') {
            $allowed = ['1024x1024', '1792x1024', '1024x1792'];
            return in_array($size, $allowed, true) ? $size : '1024x1024';
        }

        if ($model === 'dall-e-2') {
            $allowed = ['256x256', '512x512', '1024x1024'];
            return in_array($size, $allowed, true) ? $size : '1024x1024';
        }

        return $size;
    }

    protected function normalizeImageQuality(string $model, ?string $quality): ?string
    {
        $model = $this->normalizeModelName($model);
        $quality = $quality ?: 'auto';

        if ($this->isGptImageModel($model)) {
            $map = [
                'standard' => 'medium',
                'hd' => 'high',
                'low' => 'low',
                'medium' => 'medium',
                'high' => 'high',
                'auto' => 'auto',
            ];

            return $map[$quality] ?? 'auto';
        }

        if ($model === 'dall-e-3') {
            return in_array($quality, ['standard', 'hd'], true) ? $quality : 'standard';
        }

        if ($model === 'dall-e-2') {
            return null;
        }

        return $quality;
    }

    protected function getDefaultMaxOutputTokens(?string $articleLength = null): int
    {
        $articleLength = strtolower((string) $articleLength);

        if (str_contains($articleLength, '600-800')) {
            return 1800;
        }

        if (str_contains($articleLength, '800-1200')) {
            return 2600;
        }

        if (str_contains($articleLength, '1800-2500')) {
            return 5200;
        }

        return 3800;
    }

    protected function postChatCompletion(string $key, array $body, int $timeout = 180)
    {
        return Http::withHeaders([
            'Authorization' => 'Bearer ' . $key,
            'Content-Type' => 'application/json',
        ])->timeout($timeout)->post('https://api.openai.com/v1/chat/completions', $body);
    }

    protected function logOpenAiFailure(string $endpoint, string $model, $response, array $body): void
    {
        $error = $response->json();

        Log::error("[OpenAIService] {$endpoint} request failed", [
            'model' => $model,
            'status' => $response->status(),
            'message' => $error['error']['message'] ?? null,
            'code' => $error['error']['code'] ?? null,
            'body_keys' => array_keys($body),
        ]);
    }

    /**
     * Test OpenAI API connection with a given key or stored key.
     */
    public function testConnection(?string $apiKey = null, ?string $modelOverride = null): array
    {
        $key = $apiKey ?: $this->getApiKey();
        if (!$key) {
            return [
                'success' => false,
                'message' => 'Chưa cấu hình OpenAI API key.',
            ];
        }

        $model = trim((string) ($modelOverride ?: $this->getSetting('ai_text_model', 'gpt-4o-mini')));
        $model = $model !== '' ? $model : 'gpt-4o-mini';

        $body = [
            'model' => $model,
            'messages' => [
                ['role' => 'user', 'content' => 'ping'],
            ],
        ];

        if ($this->shouldUseMaxCompletionTokens($model)) {
            $body['max_completion_tokens'] = 5;
        } else {
            $body['max_tokens'] = 5;
        }

        try {
            $response = $this->postChatCompletion($key, $body, 10);

            if (!$response->successful()) {
                $errorMessage = $response->json('error.message') ?? '';

                if (str_contains($errorMessage, "Unsupported parameter: 'max_tokens'")) {
                    unset($body['max_tokens']);
                    $body['max_completion_tokens'] = 5;
                    $response = $this->postChatCompletion($key, $body, 10);
                }
            }

            if ($response->successful()) {
                return [
                    'success' => true,
                    'message' => "Kết nối thành công với model: {$model}",
                ];
            }

            $error = $response->json();
            $errorMessage = $error['error']['message'] ?? 'Unknown API error.';
            $errorCode = $error['error']['code'] ?? null;

            $this->logOpenAiFailure('Chat test', $model, $response, $body);

            if ($response->status() === 404 && $errorCode === 'model_not_found') {
                return [
                    'success' => false,
                    'message' => "Model '{$model}' chưa khả dụng với API key này. Vui lòng kiểm tra lại model hoặc đổi sang gpt-4o-mini.",
                    'details' => $errorMessage,
                ];
            }

            return [
                'success' => false,
                'message' => 'OpenAI trả lỗi ' . $response->status() . ($errorMessage ? ': ' . $errorMessage : ''),
                'details' => $errorMessage,
            ];
        } catch (\Exception $e) {
            return [
                'success' => false,
                'message' => 'Không thể kết nối OpenAI API: ' . $e->getMessage(),
            ];
        }
    }

    /**
     * Generate article content using OpenAI chat completions.
     */
    public function generateArticleWithResponsesApi(string $prompt, array $options = []): array
    {
        $key = $this->getApiKey();
        if (!$key) {
            throw new \Exception('OpenAI API Key is not configured.');
        }

        $model = $this->getSetting('ai_text_model', 'gpt-4o-mini');
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
        $maxOutputTokens = $options['max_completion_tokens']
            ?? $options['max_tokens']
            ?? $this->getDefaultMaxOutputTokens($options['article_length'] ?? null);

        $body = [
            'model' => $model,
            'messages' => [
                [
                    'role' => 'system',
                    'content' => 'You are a professional real estate SEO content writer. Always respond in JSON format matching the requested schema.',
                ],
                [
                    'role' => 'user',
                    'content' => $prompt,
                ],
            ],
            'response_format' => ['type' => 'json_object'],
        ];

        if ($this->shouldUseMaxCompletionTokens($model)) {
            $body['max_completion_tokens'] = $maxOutputTokens;
        } else {
            $body['max_tokens'] = $maxOutputTokens;
        }

        if ($this->supportsTemperature($model)) {
            $body['temperature'] = $options['temperature'] ?? 0.7;
        }

        try {
            $response = $this->postChatCompletion($key, $body);

            if (!$response->successful()) {
                $errorMessage = $response->json('error.message') ?? '';

                if (str_contains($errorMessage, "Unsupported parameter: 'max_tokens'")) {
                    unset($body['max_tokens']);
                    $body['max_completion_tokens'] = $maxOutputTokens;
                    $response = $this->postChatCompletion($key, $body);
                    $errorMessage = $response->json('error.message') ?? '';
                }

                if (!$response->successful() && str_contains($errorMessage, "Unsupported parameter: 'temperature'")) {
                    unset($body['temperature']);
                    $response = $this->postChatCompletion($key, $body);
                    $errorMessage = $response->json('error.message') ?? '';
                }
            }

            if ($response->successful()) {
                return [
                    'success' => true,
                    'data' => $response->json(),
                    'model_used' => $model,
                ];
            }

            $error = $response->json();
            $errorMessage = $error['error']['message'] ?? 'API request failed.';
            $errorCode = $error['error']['code'] ?? null;

            $this->logOpenAiFailure('Chat completion', $model, $response, $body);

            if ($response->status() === 404 && $errorCode === 'model_not_found') {
                if ($enableFallback && $fallbackModel && $model !== $fallbackModel) {
                    Log::warning("[OpenAIService] Model '{$model}' not found. Falling back to '{$fallbackModel}'.");
                    return $this->executeTextRequest($prompt, $fallbackModel, $key, false, null, $options);
                }

                throw new \Exception('Model AI hiện tại không khả dụng hoặc tài khoản chưa được cấp quyền sử dụng model này. Vui lòng kiểm tra lại model trong phần Cấu hình AI.');
            }

            throw new \Exception($errorMessage);
        } catch (\Exception $e) {
            Log::error('[OpenAIService] Text generation error: ' . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Generate an image using the OpenAI Images endpoint.
     */
    public function generateImageWithImageApi(string $prompt, ?string $size = null, ?string $quality = null): string
    {
        $key = $this->getApiKey();
        if (!$key) {
            throw new \Exception('OpenAI API Key is not configured.');
        }

        $model = $this->getSetting('ai_image_model', 'gpt-image-1');
        $imgSize = $size ?: $this->getSetting('ai_default_image_size', '1536x1024');
        $imgQuality = $quality ?: $this->getSetting('ai_default_image_quality', 'medium');

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
        $model = $this->normalizeModelName($model);
        $size = $this->normalizeImageSize($model, $size);
        $quality = $this->normalizeImageQuality($model, $quality);

        $body = [
            'model' => $model,
            'prompt' => $prompt,
            'n' => 1,
            'size' => $size,
        ];

        if ($this->isDalleModel($model)) {
            $body['response_format'] = 'b64_json';
        }

        if ($quality !== null) {
            $body['quality'] = $quality;
        }

        try {
            $response = Http::withHeaders([
                'Authorization' => 'Bearer ' . $key,
                'Content-Type' => 'application/json',
            ])->timeout(180)->post('https://api.openai.com/v1/images/generations', $body);

            if ($response->successful()) {
                $b64Json = $response->json('data.0.b64_json');
                if ($b64Json) {
                    return $b64Json;
                }

                $url = $response->json('data.0.url');
                if ($url) {
                    $imageResponse = Http::timeout(60)->get($url);
                    if ($imageResponse->successful()) {
                        return base64_encode($imageResponse->body());
                    }
                }

                throw new \Exception('No image data returned in API response.');
            }

            $error = $response->json();
            $errorMessage = $error['error']['message'] ?? 'Image generation request failed.';
            $errorCode = $error['error']['code'] ?? null;

            $this->logOpenAiFailure('Image generation', $model, $response, $body);

            if ($response->status() === 404 && $errorCode === 'model_not_found') {
                if ($enableFallback && $fallbackModel && $model !== $fallbackModel) {
                    Log::warning("[OpenAIService] Image model '{$model}' not found. Falling back to '{$fallbackModel}'.");
                    return $this->executeImageRequest($prompt, $fallbackModel, $size, $quality ?? 'standard', $key, false, null);
                }

                throw new \Exception('Model sinh ảnh hiện tại không khả dụng hoặc tài khoản chưa được cấp quyền sử dụng model này. Vui lòng kiểm tra lại model trong phần Cấu hình AI.');
            }

            throw new \Exception($errorMessage);
        } catch (\Exception $e) {
            Log::error('[OpenAIService] Image generation error: ' . $e->getMessage());
            throw $e;
        }
    }
}
