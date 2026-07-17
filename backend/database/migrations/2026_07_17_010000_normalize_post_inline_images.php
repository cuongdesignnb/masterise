<?php

use App\Models\Post;
use App\Services\InlineArticleImageNormalizer;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        $normalizer = app(InlineArticleImageNormalizer::class);

        Post::query()
            ->select(['id', 'title', 'author_id', 'intro_content', 'content'])
            ->where(function ($query) {
                $query->where('intro_content', 'like', '%data:image%')
                    ->orWhere('content', 'like', '%data:image%');
            })
            ->chunkById(25, function ($posts) use ($normalizer) {
                foreach ($posts as $post) {
                    try {
                        $introContent = $normalizer->normalize(
                            $post->intro_content,
                            $post->author_id,
                            'Mở đầu bài viết '.$post->title,
                        );
                        $content = $normalizer->normalize(
                            $post->content,
                            $post->author_id,
                            'Nội dung bài viết '.$post->title,
                        );

                        if ($introContent !== $post->intro_content || $content !== $post->content) {
                            DB::table('posts')->where('id', $post->id)->update([
                                'intro_content' => $introContent,
                                'content' => $content,
                                'updated_at' => now(),
                            ]);
                        }
                    } catch (Throwable $exception) {
                        report($exception);
                    }
                }
            });
    }

    public function down(): void
    {
        // Converted Media Library files remain valid and must not be changed back to base64.
    }
};
