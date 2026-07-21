<?php

namespace Tests\Feature;

use App\Http\Controllers\Api\Admin\AiSettingsController;
use App\Models\Setting;
use App\Services\OpenAIService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\Client\Request;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class AiProviderIntegrationTest extends TestCase
{
    use RefreshDatabase;

    public function test_content_provider_uses_chat_completions_with_configured_base_url_and_key(): void
    {
        Setting::set('openai_api_key', Crypt::encryptString('content-key'), 'string');
        Setting::set('openai_base_url', 'https://modelapi.test/v1', 'string');
        Setting::set('openai_wire_api', 'chat_completions', 'string');
        Setting::set('openai_model', 'gpt-5.5', 'string');
        Setting::set('openai_max_tokens', 4096, 'number');

        Http::fake([
            'https://modelapi.test/v1/chat/completions' => Http::response([
                'choices' => [
                    ['message' => ['content' => '{"title":"OK"}']],
                ],
                'usage' => ['prompt_tokens' => 1, 'completion_tokens' => 2],
            ]),
        ]);

        $result = app(OpenAIService::class)->generateArticleWithResponsesApi('Viết bài test');

        $this->assertSame('{"title":"OK"}', $result['content']);
        $this->assertSame('chat_completions', $result['wire_api']);

        Http::assertSent(function (Request $request) {
            $data = $request->data();

            return $request->url() === 'https://modelapi.test/v1/chat/completions'
                && $request->hasHeader('Authorization', 'Bearer content-key')
                && ($data['model'] ?? null) === 'gpt-5.5'
                && ($data['max_tokens'] ?? null) === 4096
                && !array_key_exists('reasoning', $data)
                && !array_key_exists('store', $data)
                && !array_key_exists('instructions', $data)
                && !array_key_exists('input', $data)
                && !array_key_exists('max_output_tokens', $data);
        });
    }

    public function test_responses_api_payload_and_output_text_are_supported(): void
    {
        Setting::set('openai_api_key', Crypt::encryptString('content-key'), 'string');
        Setting::set('openai_base_url', 'https://provider.test/v1', 'string');
        Setting::set('openai_wire_api', 'responses', 'string');
        Setting::set('openai_model', 'gpt-5.5', 'string');
        Setting::set('openai_reasoning_effort', 'high', 'string');

        Http::fake([
            'https://provider.test/v1/responses' => Http::response([
                'output_text' => '{"title":"Responses OK"}',
            ]),
        ]);

        $result = app(OpenAIService::class)->generateArticleWithResponsesApi('Viết bài test');

        $this->assertSame('{"title":"Responses OK"}', $result['content']);
        $this->assertSame('responses', $result['wire_api']);

        Http::assertSent(function (Request $request) {
            $data = $request->data();

            return $request->url() === 'https://provider.test/v1/responses'
                && ($data['instructions'] ?? null)
                && ($data['input'] ?? null) === 'Viết bài test'
                && ($data['reasoning']['effort'] ?? null) === 'high'
                && ($data['store'] ?? null) === false
                && array_key_exists('max_output_tokens', $data);
        });
    }

    public function test_image_provider_uses_separate_openai_key_and_images_endpoint(): void
    {
        Setting::set('openai_api_key', Crypt::encryptString('content-key'), 'string');
        Setting::set('openai_image_api_key', Crypt::encryptString('image-key'), 'string');
        Setting::set('openai_image_base_url', 'https://api.openai.test/v1', 'string');
        Setting::set('openai_image_model', 'gpt-image-2', 'string');
        Setting::set('openai_image_quality', 'medium', 'string');

        Http::fake([
            'https://api.openai.test/v1/images/generations' => Http::response([
                'data' => [
                    ['b64_json' => base64_encode('fake-image')],
                ],
            ]),
        ]);

        $result = app(OpenAIService::class)->generateImageWithImageApi('Ảnh minh họa', '1536x1024', 'medium');

        $this->assertSame(base64_encode('fake-image'), $result);

        Http::assertSent(function (Request $request) {
            $data = $request->data();

            return $request->url() === 'https://api.openai.test/v1/images/generations'
                && $request->hasHeader('Authorization', 'Bearer image-key')
                && !$request->hasHeader('Authorization', 'Bearer content-key')
                && ($data['model'] ?? null) === 'gpt-image-2'
                && ($data['quality'] ?? null) === 'medium'
                && ($data['output_format'] ?? null) === 'png';
        });
    }

    public function test_missing_image_key_does_not_fallback_to_content_key(): void
    {
        Setting::set('openai_api_key', Crypt::encryptString('content-key'), 'string');
        Setting::set('openai_image_base_url', 'https://api.openai.test/v1', 'string');

        Http::fake();

        $this->expectExceptionMessage('OpenAI Image API Key is not configured.');

        try {
            app(OpenAIService::class)->generateImageWithImageApi('Ảnh minh họa');
        } finally {
            Http::assertNothingSent();
        }
    }

    public function test_http_base_urls_are_rejected(): void
    {
        Setting::set('openai_api_key', Crypt::encryptString('content-key'), 'string');
        Setting::set('openai_base_url', 'http://provider.test/v1', 'string');

        $this->expectExceptionMessage('Content Base URL phải dùng HTTPS.');

        app(OpenAIService::class)->getContentConfig();
    }

    public function test_settings_response_never_returns_plain_api_keys(): void
    {
        Setting::set('openai_api_key', Crypt::encryptString('content-secret'), 'string');
        Setting::set('openai_image_api_key', Crypt::encryptString('image-secret'), 'string');

        $response = (new AiSettingsController(app(OpenAIService::class)))->index();
        $data = $response->getData(true)['data'];

        $this->assertArrayNotHasKey('openai_api_key', $data);
        $this->assertArrayNotHasKey('openai_image_api_key', $data);
        $this->assertTrue($data['content_api_key_configured']);
        $this->assertTrue($data['image_api_key_configured']);
        $this->assertStringNotContainsString('secret', $data['content_api_key_masked']);
        $this->assertStringNotContainsString('secret', $data['image_api_key_masked']);
    }
}
