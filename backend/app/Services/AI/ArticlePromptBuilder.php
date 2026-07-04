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
3. "excerpt": A short summary of 2-3 sentences.
4. "seo_title": An SEO optimized title tag (under 60 characters).
5. "seo_description": An SEO meta description (under 160 characters).
6. "seo_keywords": An array of 5-8 relevant search keywords.
7. "content_html": The full article body in clean HTML format. It MUST start with an <h2> section heading, include at least 4 <h2> headings, use <h3> for FAQ questions, use <p> for paragraphs, and use <ul><li> lists where useful. Do not return one long paragraph. Do NOT wrap the HTML inside a markdown code block, just output the HTML as a plain JSON string.
8. "image_prompt": A highly descriptive prompt in English to be used with an AI image generator to create a premium featured image for this article.
9. "cta": A prominent final call to action string.

Content Constraints & Safety Guidelines:
- If language is "vi", write natural Vietnamese with full diacritics.
- Include at least 4 useful H2 sections and optional H3 subsections.
- Include a short FAQ section at the end with 4 questions and answers.
- The first visible HTML element inside content_html must be <h2>, not a plain paragraph.
- Never use markdown headings such as ## or ### inside content_html. Use real HTML tags only.
- Write specifically from the perspective of Masterise Homes, reflecting premium quality, luxury, and professional branding.
- Do not invent exact prices, legal status, launch dates, payment policies, or investment returns unless they are provided in the source input. Use neutral wording and invite readers to contact the sales team for official updates.
- Do not make absolute guarantees of investment return or promises of profit.
- Make image_prompt suitable for a premium real estate editorial thumbnail: photorealistic luxury architecture, natural lighting, high-end atmosphere, no text, no logo, no watermark, no brand mark.
- Do NOT output any conversational text or markdown wrappers around the JSON object (e.g. do not wrap in ```json ... ```). Output ONLY the raw JSON object.
PROMPT;
    }

    /**
     * Build the fallback image prompt if the AI text API output prompt is empty or fails.
     */
    public function buildFallbackImagePrompt(string $title): string
    {
        return "Premium featured image illustrating luxury real estate for the article titled: '{$title}'. Photorealistic modern architecture, high-end editorial style, cinematic natural lighting, warm champagne and white palette, no text, no logo, no watermark.";
    }
}
