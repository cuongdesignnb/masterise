<?php

namespace App\Services;

use App\Models\Setting;
use Illuminate\Http\Client\Response;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use InvalidArgumentException;

class OpenAIService
{
    protected string $provider = 'openai';

    public function getApiKey(): ?string
    {
        return $this->getContentApiKey();
    }

    public function getContentApiKey(?string $override = null): ?string
    {
        if ($this->filled($override)) {
            return trim((string) $override);
        }

        $storedKey = $this->getEncryptedSetting('openai_api_key')
            ?: $this->getEncryptedSetting('ai_openai_api_key');

        if ($storedKey) {
            return $storedKey;
        }

        return $this->filled(config('services.openai.api_key'))
            ? trim((string) config('services.openai.api_key'))
            : null;
    }

    public function getImageApiKey(?string $override = null): ?string
    {
        if ($this->filled($override)) {
            return trim((string) $override);
        }

        $storedKey = $this->getEncryptedSetting('openai_image_api_key');

        if ($storedKey) {
            return $storedKey;
        }

        return $this->filled(config('services.openai.image_api_key'))
            ? trim((string) config('services.openai.image_api_key'))
            : null;
    }

    public function getContentConfig(array $overrides = []): array
    {
        $config = [
            'api_key' => $this->getContentApiKey($overrides['openai_api_key'] ?? $overrides['ai_openai_api_key'] ?? null),
            'base_url' => $overrides['openai_base_url']
                ?? $this->getSettingValue('openai_base_url', config('services.openai.base_url', 'https://modelapi.vn/v1')),
            'wire_api' => $overrides['openai_wire_api']
                ?? $this->getSettingValue('openai_wire_api', config('services.openai.wire_api', 'chat_completions')),
            'model' => $overrides['openai_model']
                ?? $overrides['ai_text_model']
                ?? $this->getSettingValue('openai_model', $this->getSettingValue('ai_text_model', config('services.openai.model', 'gpt-5.5'))),
            'reasoning_effort' => $overrides['openai_reasoning_effort']
                ?? $this->getSettingValue('openai_reasoning_effort', config('services.openai.reasoning_effort', 'high')),
            'max_tokens' => $overrides['openai_max_tokens']
                ?? $this->getSettingValue('openai_max_tokens', config('services.openai.max_tokens', 4096)),
        ];

        $config['base_url'] = $this->normalizeHttpsBaseUrl($config['base_url'], 'Content Base URL');
        $config['wire_api'] = in_array($config['wire_api'], ['chat_completions', 'responses'], true)
            ? $config['wire_api']
            : 'chat_completions';
        $config['model'] = trim((string) $config['model']) ?: 'gpt-5.5';
        $config['reasoning_effort'] = trim((string) $config['reasoning_effort']) ?: 'high';
        $config['max_tokens'] = $this->normalizeMaxTokens($config['max_tokens']);

        return $config;
    }

    public function getImageConfig(array $overrides = []): array
    {
        $config = [
            'api_key' => $this->getImageApiKey($overrides['openai_image_api_key'] ?? null),
            'base_url' => $overrides['openai_image_base_url']
                ?? $this->getSettingValue('openai_image_base_url', config('services.openai.image_base_url', 'https://api.openai.com/v1')),
            'model' => $overrides['openai_image_model']
                ?? $overrides['ai_image_model']
                ?? $this->getSettingValue('openai_image_model', $this->getSettingValue('ai_image_model', config('services.openai.image_model', 'gpt-image-2'))),
            'quality' => $overrides['openai_image_quality']
                ?? $overrides['ai_default_image_quality']
                ?? $this->getSettingValue('openai_image_quality', $this->getSettingValue('ai_default_image_quality', config('services.openai.image_quality', 'medium'))),
        ];

        $config['base_url'] = $this->normalizeHttpsBaseUrl($config['base_url'], 'Image Base URL');
        $config['model'] = trim((string) $config['model']) ?: 'gpt-image-2';
        $config['quality'] = $this->normalizeImageQuality($config['model'], $config['quality']);

        return $config;
    }

    protected function getEncryptedSetting(string $key): ?string
    {
        $encryptedKey = Setting::get($key);
        if (!$this->filled($encryptedKey)) {
            return null;
        }

        try {
            return Crypt::decryptString($encryptedKey);
        } catch (\Exception $e) {
            Log::error("[OpenAIService] Failed to decrypt {$key}: " . $e->getMessage());
            return null;
        }
    }

    protected function getSettingValue(string $key, $default = null)
    {
        $dbVal = Setting::get($key);

        return $this->filled($dbVal) ? $dbVal : $default;
    }

    protected function filled($value): bool
    {
        return $value !== null && trim((string) $value) !== '';
    }

    protected function normalizeHttpsBaseUrl($url, string $label): string
    {
        $url = rtrim(trim((string) $url), '/');
        if ($url === '' || !filter_var($url, FILTER_VALIDATE_URL)) {
            throw new InvalidArgumentException("{$label} không hợp lệ.");
        }

        $scheme = parse_url($url, PHP_URL_SCHEME);
        if ($scheme !== 'https') {
            throw new InvalidArgumentException("{$label} phải dùng HTTPS.");
        }

        return $url;
    }

    protected function normalizeMaxTokens($value): int
    {
        $tokens = (int) $value;
        if ($tokens < 1) {
            return 4096;
        }

        return min($tokens, 128000);
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

    public function testConnection(?string $apiKey = null, ?string $modelOverride = null, array $overrides = []): array
    {
        try {
            $config = $this->getContentConfig(array_merge($overrides, [
                'openai_api_key' => $apiKey,
                'openai_model' => $modelOverride ?: ($overrides['openai_model'] ?? null),
            ]));
        } catch (\Exception $e) {
            return [
                'success' => false,
                'message' => $e->getMessage(),
            ];
        }

        if (!$config['api_key']) {
            return [
                'success' => false,
                'message' => 'Chưa cấu hình API key cho AI Provider viết bài.',
            ];
        }

        try {
            $response = $this->sendTextRequest('Reply only: OK', $config, 15, [
                'max_tokens' => 32,
                'temperature' => 0,
            ]);

            if ($response['success']) {
                return [
                    'success' => true,
                    'message' => "Kết nối thành công với model: {$config['model']}",
                ];
            }

            return [
                'success' => false,
                'message' => $response['message'] ?? 'AI Provider trả lỗi.',
                'details' => $response['details'] ?? null,
            ];
        } catch (\Exception $e) {
            return [
                'success' => false,
                'message' => 'Không thể kết nối AI Provider: ' . $e->getMessage(),
            ];
        }
    }

    public function generateArticleWithResponsesApi(string $prompt, array $options = []): array
    {
        $config = $this->getContentConfig($options);
        if (!$config['api_key']) {
            throw new \Exception('AI Provider API Key is not configured.');
        }

        $maxOutputTokens = $options['max_completion_tokens']
            ?? $options['max_tokens']
            ?? $config['max_tokens']
            ?? $this->getDefaultMaxOutputTokens($options['article_length'] ?? null);

        $result = $this->sendTextRequest($prompt, $config, 180, [
            'max_tokens' => $maxOutputTokens,
            'temperature' => $options['temperature'] ?? 0.7,
        ]);

        if (!$result['success']) {
            throw new \Exception($result['message'] ?? 'Upstream request failed');
        }

        return [
            'success' => true,
            'data' => $result['data'],
            'content' => $this->extractTextContent($result['data']),
            'model_used' => $config['model'],
            'wire_api' => $config['wire_api'],
        ];
    }

    protected function sendTextRequest(string $prompt, array $config, int $timeout, array $options): array
    {
        $body = $config['wire_api'] === 'responses'
            ? $this->buildResponsesPayload($prompt, $config, $options)
            : $this->buildChatCompletionsPayload($prompt, $config, $options);

        $endpoint = $config['wire_api'] === 'responses' ? '/responses' : '/chat/completions';
        $response = Http::withHeaders([
            'Authorization' => 'Bearer ' . $config['api_key'],
            'Content-Type' => 'application/json',
            'Accept' => 'application/json',
        ])->timeout($timeout)->post($config['base_url'] . $endpoint, $body);

        if ($response->successful()) {
            return [
                'success' => true,
                'data' => $response->json() ?: [],
            ];
        }

        $this->logProviderFailure($endpoint, $config, $response, $body);

        return [
            'success' => false,
            'message' => $this->providerErrorMessage($response),
            'details' => $response->json(),
            'provider_status' => $response->status(),
        ];
    }

    protected function buildChatCompletionsPayload(string $prompt, array $config, array $options): array
    {
        $body = [
            'model' => $config['model'],
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
        ];

        $body['max_tokens'] = $this->normalizeMaxTokens($options['max_tokens'] ?? $config['max_tokens']);

        if ($this->supportsTemperature($config['model'])) {
            $body['temperature'] = $options['temperature'] ?? 0.7;
        }

        return $body;
    }

    protected function buildResponsesPayload(string $prompt, array $config, array $options): array
    {
        return [
            'model' => $config['model'],
            'instructions' => 'You are a professional real estate SEO content writer. Always respond in JSON format matching the requested schema.',
            'input' => $prompt,
            'reasoning' => [
                'effort' => $config['reasoning_effort'],
            ],
            'max_output_tokens' => $this->normalizeMaxTokens($options['max_tokens'] ?? $config['max_tokens']),
            'store' => false,
        ];
    }

    public function extractTextContent(array $payload): ?string
    {
        if ($this->filled($payload['output_text'] ?? null)) {
            return (string) $payload['output_text'];
        }

        foreach (($payload['output'] ?? []) as $output) {
            foreach (($output['content'] ?? []) as $content) {
                if ($this->filled($content['text'] ?? null)) {
                    return (string) $content['text'];
                }
            }
        }

        $messageContent = $payload['choices'][0]['message']['content'] ?? null;
        if (is_string($messageContent) && $this->filled($messageContent)) {
            return $messageContent;
        }

        if (is_array($messageContent)) {
            $parts = [];
            foreach ($messageContent as $part) {
                if ($this->filled($part['text'] ?? null)) {
                    $parts[] = (string) $part['text'];
                }
            }

            if ($parts) {
                return implode('', $parts);
            }
        }

        if ($this->filled($payload['choices'][0]['text'] ?? null)) {
            return (string) $payload['choices'][0]['text'];
        }

        return null;
    }

    public function generateImageWithImageApi(string $prompt, ?string $size = null, ?string $quality = null, array $overrides = []): string
    {
        $config = $this->getImageConfig($overrides);
        if (!$config['api_key']) {
            throw new \Exception('OpenAI Image API Key is not configured.');
        }

        $model = $this->normalizeModelName($config['model']);
        $imgSize = $this->normalizeImageSize($model, $size ?: $this->getSettingValue('ai_default_image_size', '1536x1024'));
        $imgQuality = $this->normalizeImageQuality($model, $quality ?: $config['quality']);

        $body = [
            'model' => $model,
            'prompt' => $prompt,
            'n' => 1,
            'size' => $imgSize,
        ];

        if ($imgQuality !== null) {
            $body['quality'] = $imgQuality;
        }

        if ($this->isGptImageModel($model)) {
            $body['output_format'] = 'png';
        }

        if ($this->isDalleModel($model)) {
            $body['response_format'] = 'b64_json';
        }

        try {
            $response = Http::withHeaders([
                'Authorization' => 'Bearer ' . $config['api_key'],
                'Content-Type' => 'application/json',
                'Accept' => 'application/json',
            ])->timeout(180)->post($config['base_url'] . '/images/generations', $body);

            if ($response->successful()) {
                $b64Json = $response->json('data.0.b64_json');
                if ($this->filled($b64Json)) {
                    return (string) $b64Json;
                }

                $url = $response->json('data.0.url');
                if ($this->filled($url)) {
                    $scheme = parse_url((string) $url, PHP_URL_SCHEME);
                    if ($scheme !== 'https') {
                        throw new \Exception('Image API returned a non-HTTPS image URL.');
                    }

                    $imageResponse = Http::timeout(60)->get((string) $url);
                    if ($imageResponse->successful()) {
                        return base64_encode($imageResponse->body());
                    }
                }

                throw new \Exception('No image data returned in API response.');
            }

            $this->logProviderFailure('/images/generations', $config, $response, $body);
            throw new \Exception($this->providerErrorMessage($response));
        } catch (\Exception $e) {
            Log::error('[OpenAIService] Image generation error: ' . $e->getMessage());
            throw $e;
        }
    }

    protected function providerErrorMessage(Response $response): string
    {
        $json = $response->json();
        if (is_array($json)) {
            return $json['error']['message']
                ?? $json['message']
                ?? 'Upstream request failed';
        }

        return 'Upstream request failed';
    }

    protected function logProviderFailure(string $endpoint, array $config, Response $response, array $body): void
    {
        Log::error("[OpenAIService] {$endpoint} request failed", [
            'host' => parse_url($config['base_url'] ?? '', PHP_URL_HOST),
            'model' => $config['model'] ?? null,
            'status' => $response->status(),
            'message' => mb_substr($this->providerErrorMessage($response), 0, 240),
            'response_keys' => is_array($response->json()) ? array_keys($response->json()) : [],
            'body_keys' => array_keys($body),
        ]);
    }
}
