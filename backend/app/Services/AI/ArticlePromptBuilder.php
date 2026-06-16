<?php

namespace App\Services\AI;

class ArticlePromptBuilder
{
    /**
     * Build the text generation prompt for a single article or keyword.
     */
    public function buildArticlePrompt(string $input, array $settings = []): string
    {
        $language = $settings['language'] ?? 'vi';
        $tone = $settings['tone'] ?? 'Sang trọng, chuyên nghiệp, chuẩn SEO bất động sản';
        $length = $settings['article_length'] ?? '1200-1800 words';

        return <<<PROMPT
Write a high-end real estate news article or blog post about: "{$input}".
Tone of voice: {$tone}.
Desired article length: {$length}.
Language: {$language}.

You must structure the response as a single valid JSON object containing exactly the following keys:
1. "title": The title of the article.
2. "slug_suggestion": A URL-friendly slug suggestion based on the title (lowercase, hyphens, ASCII only).
3. "excerpt": A short summaries of 2-3 sentences.
4. "seo_title": An SEO optimized title tag (under 60 characters).
5. "seo_description": An SEO meta description (under 160 characters).
6. "seo_keywords": An array of 5-8 relevant search keywords.
7. "content_html": The full article body in clean HTML format. Use proper H2 and H3 header tags, paragraphs, and list items where appropriate. Make sure the content has a clear introduction, body, and conclusion. Add call-to-actions (CTAs) for project consultations or showroom appointments. Do NOT wrap the HTML inside a markdown code block, just output the HTML as a plain JSON string.
8. "image_prompt": A highly descriptive prompt in English to be used with an AI image generator (like DALL-E) to create a premium featured image for this article. The prompt should specify luxury real estate styles, natural lighting, high-end architecture, no text, and no logos.
9. "cta": A prominent final call to action string.

Content Constraints & Safety Guidelines:
- Write specifically from the perspective of Masterise Homes, reflecting premium quality, luxury, and professional branding.
- Avoid hallucinating or inventing specific pricing details, launch dates, or legal approvals unless they are universally verified. Keep statements neutral, e.g. "Vui lòng liên hệ Hotline để nhận bảng giá chính thức mới nhất".
- Do NOT make absolute guarantees of investment return or absolute promises of profit.
- Do NOT output any conversational text or markdown wrappers around the JSON object (e.g. do not wrap in ```json ... ```). Output ONLY the raw JSON object.
PROMPT;
    }

    /**
     * Build the fallback image prompt if the AI text API output prompt is empty or fails.
     */
    public function buildFallbackImagePrompt(string $title): string
    {
        return "Premium featured image illustrating luxury real estate for the article titled: '{$title}'. Architectural rendering, modern building design, high-end editorial style, cinematic natural lighting, golden champagne and warm white color palette, 8k resolution, no text, no logo.";
    }
}
