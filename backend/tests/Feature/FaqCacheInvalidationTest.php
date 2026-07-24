<?php

namespace Tests\Feature;

use App\Models\Faq;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\Client\Request;
use Illuminate\Support\Facades\Http;
use Tests\Concerns\BuildsSeoReviewFixtures;
use Tests\TestCase;

class FaqCacheInvalidationTest extends TestCase
{
    use RefreshDatabase, BuildsSeoReviewFixtures;

    public function test_admin_faq_mutations_revalidate_homepage_faq_tag(): void
    {
        config([
            'services.next_revalidation.url' => 'https://frontend.test/api/revalidate',
            'services.next_revalidation.secret' => 'test-secret',
        ]);
        Http::fake([
            'https://frontend.test/api/revalidate' => Http::response(['ok' => true], 200),
        ]);

        $admin = $this->userWithRole('admin');

        $this->actingAs($admin, 'sanctum')
            ->postJson('/api/v1/faqs', [
                'question' => 'FAQ cần revalidate?',
                'answer' => 'Có.',
                'sort_order' => 1,
                'is_active' => true,
            ])
            ->assertCreated();

        $faq = Faq::firstOrFail();

        $this->actingAs($admin, 'sanctum')
            ->putJson("/api/v1/faqs/{$faq->id}", [
                'question' => 'FAQ đã cập nhật?',
                'answer' => 'Có.',
                'sort_order' => 2,
                'is_active' => true,
            ])
            ->assertOk();

        $this->actingAs($admin, 'sanctum')
            ->deleteJson("/api/v1/faqs/{$faq->id}")
            ->assertOk();

        Http::assertSentCount(3);
        Http::assertSent(function (Request $request) {
            return $request->url() === 'https://frontend.test/api/revalidate'
                && $request->hasHeader('Authorization', 'Bearer test-secret')
                && $request['tags'] === ['faqs'];
        });
    }
}
