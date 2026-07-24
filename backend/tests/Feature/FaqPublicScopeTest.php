<?php

namespace Tests\Feature;

use App\Models\Faq;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class FaqPublicScopeTest extends TestCase
{
    use RefreshDatabase;

    public function test_public_faq_endpoint_returns_only_active_faqs_in_sort_order(): void
    {
        Faq::create([
            'question' => 'Inactive FAQ',
            'answer' => 'Hidden',
            'sort_order' => 1,
            'is_active' => false,
        ]);
        $second = Faq::create([
            'question' => 'Second visible FAQ',
            'answer' => 'Visible',
            'sort_order' => 20,
            'is_active' => true,
        ]);
        $first = Faq::create([
            'question' => 'First visible FAQ',
            'answer' => 'Visible',
            'sort_order' => 10,
            'is_active' => true,
        ]);

        $this->getJson('/api/v1/faqs')
            ->assertOk()
            ->assertJsonCount(2, 'data')
            ->assertJsonPath('data.0.id', $first->id)
            ->assertJsonPath('data.1.id', $second->id);
    }
}
