<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

return new class extends Migration
{
    private const SLUG = 'danh-gia-cac-khu-vuc-huong-loi-tu-he-thong-vanh-dai-ha-noi-khu-vuc-nao-co-tiem-nang-phat-trien-noi-bat';

    public function up(): void
    {
        $post = DB::table('posts')->where('slug', self::SLUG)->first(['id', 'content']);
        if (!$post || !$post->content) {
            return;
        }

        $replacements = [
            '<tr><td data-row="1">Tiêu chíNội dung</td></tr>'
                => '<tr><th data-row="1">Tiêu chí</th><th data-row="1">Nội dung</th></tr>',
            '<tr><td data-row="1">Khu vựcKết nốiQuy hoạchDư địa phát triểnĐánh giá tổng quan</td></tr>'
                => '<tr><th data-row="1">Khu vực</th><th data-row="1">Kết nối</th><th data-row="1">Quy hoạch</th><th data-row="1">Dư địa phát triển</th><th data-row="1">Đánh giá tổng quan</th></tr>',
        ];

        $repaired = str_replace(array_keys($replacements), array_values($replacements), $post->content, $replacementCount);
        if ($replacementCount > 0 && $repaired !== $post->content) {
            DB::table('posts')->where('id', $post->id)->update(['content' => $repaired]);
            Log::info('Repaired ring-road article table headers', [
                'post_id' => (int) $post->id,
                'repaired_header_rows' => $replacementCount,
            ]);
        }
    }

    public function down(): void
    {
        // Correct table cell boundaries are intentionally retained.
    }
};
