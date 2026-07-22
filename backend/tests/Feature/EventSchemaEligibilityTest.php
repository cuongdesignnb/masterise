<?php

namespace Tests\Feature;

use App\Models\Post;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class EventSchemaEligibilityTest extends TestCase
{
    use RefreshDatabase;

    public function test_event_structured_fields_persist_without_fabricated_fallbacks(): void
    {
        $post = Post::create([
            'title' => 'RC3 Event', 'slug' => 'rc3-event', 'post_type' => 'event', 'status' => 'draft',
            'author_id' => User::factory()->create()->id,
            'event_start_at' => now()->addWeek(), 'event_attendance_mode' => 'Online',
            'event_status' => 'Scheduled', 'event_online_url' => 'https://example.test/event',
            'event_country' => 'VN', 'event_price' => 0, 'event_currency' => 'VND',
        ]);

        $this->assertSame('Online', $post->fresh()->event_attendance_mode);
        $this->assertSame('https://example.test/event', $post->fresh()->event_online_url);
        $this->assertNull($post->fresh()->event_location_name);
        $this->assertNull($post->fresh()->event_street_address);
    }
}
