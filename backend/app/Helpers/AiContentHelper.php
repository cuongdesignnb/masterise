<?php

namespace App\Helpers;

use App\Models\Post;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Log;

class AiContentHelper
{
    /**
     * Whitelist of allowed HTML tags.
     */
    protected static array $allowedTags = [
        'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
        'p', 'br', 'hr',
        'ul', 'ol', 'li',
        'strong', 'em', 'span', 'b', 'i', 'u', 's', 'sub', 'sup',
        'a', 'blockquote',
        'table', 'caption', 'colgroup', 'col', 'thead', 'tbody', 'tfoot', 'tr', 'th', 'td',
        'img', 'figure', 'figcaption'
    ];

    /**
     * Sanitize HTML content using DOMDocument.
     * Removes scripts, unsafe styles, iframes, and javascript events.
     */
    public static function sanitizeHtml(string $html): string
    {
        if (empty(trim($html))) {
            return '';
        }

        // Clean any odd null bytes
        $html = str_replace(chr(0), '', $html);

        // Disable standard libxml errors to prevent warning printouts
        $internalErrors = libxml_use_internal_errors(true);

        try {
            $dom = new \DOMDocument();
            // Load HTML with UTF-8 encoding configuration
            $dom->loadHTML('<?xml encoding="utf-8" ?>' . $html, LIBXML_HTML_NOIMPLIED | LIBXML_HTML_NODEFDTD);

            $xpath = new \DOMXPath($dom);

            // 1. Remove blacklisted elements completely
            $blacklistedElements = ['script', 'style', 'iframe', 'object', 'embed', 'applet', 'frameset', 'frame', 'link'];
            foreach ($blacklistedElements as $tag) {
                $nodes = $xpath->query('//' . $tag);
                foreach ($nodes as $node) {
                    $node->parentNode->removeChild($node);
                }
            }

            // 2. Filter attributes on all nodes
            $allNodes = $xpath->query('//*');
            foreach ($allNodes as $node) {
                // Check whitelist tags
                if (!in_array(strtolower($node->nodeName), self::$allowedTags)) {
                    // Replace node with text content or remove if empty
                    $textNode = $dom->createTextNode($node->nodeValue);
                    $node->parentNode->replaceChild($textNode, $node);
                    continue;
                }

                // Keep only the small set of structural/editor attributes used by public content.
                $attrsToRemove = [];
                if ($node->hasAttributes()) {
                    foreach ($node->attributes as $attr) {
                        $name = strtolower($attr->name);
                        if (!self::isAllowedAttribute(strtolower($node->nodeName), $name, $attr->value)) {
                            $attrsToRemove[] = $attr->name;
                        }
                    }
                    foreach ($attrsToRemove as $attrName) {
                        $node->removeAttribute($attrName);
                    }
                }

                if ($node->hasAttribute('class')) {
                    $safeClasses = self::sanitizeClassValue($node->getAttribute('class'));
                    $safeClasses === '' ? $node->removeAttribute('class') : $node->setAttribute('class', $safeClasses);
                }

                if ($node->hasAttribute('style')) {
                    $safeStyle = self::sanitizeStyleValue($node->getAttribute('style'));
                    $safeStyle === '' ? $node->removeAttribute('style') : $node->setAttribute('style', $safeStyle);
                }

                // Add rel="noopener noreferrer" to external <a> tags
                if (strtolower($node->nodeName) === 'a') {
                    $href = $node->getAttribute('href');
                    if ($href && (str_starts_with($href, 'http://') || str_starts_with($href, 'https://'))) {
                        $node->setAttribute('target', '_blank');
                        $node->setAttribute('rel', 'noopener noreferrer');
                    }
                }
            }

            // Save HTML back to string
            $cleanHtml = $dom->saveHTML();
            
            // Remove XML encoding header if added
            $cleanHtml = str_replace('<?xml encoding="utf-8" ?>', '', $cleanHtml);
            
            return trim($cleanHtml);

        } catch (\Exception $e) {
            Log::error('[AiContentHelper] HTML sanitization error: ' . $e->getMessage());
            // Fallback to strip_tags if DOMDocument crashes
            $allowableTagsString = '<' . implode('><', self::$allowedTags) . '>';
            return strip_tags($html, $allowableTagsString);
        } finally {
            libxml_use_internal_errors($internalErrors);
        }
    }

    private static function isAllowedAttribute(string $tag, string $name, string $value): bool
    {
        if (str_starts_with($name, 'on') || str_contains(strtolower($value), 'javascript:')) {
            return false;
        }

        if ($name === 'style') return self::sanitizeStyleValue($value) !== '';

        if (in_array($name, ['class', 'id', 'title'], true)) {
            return $name !== 'id' || preg_match('/^[A-Za-z][A-Za-z0-9_-]*$/', $value) === 1;
        }
        if ($tag === 'a' && in_array($name, ['href', 'target', 'rel'], true)) {
            return $name !== 'href' || self::isSafeUrl($value, true);
        }
        if ($tag === 'img' && in_array($name, ['src', 'alt', 'width', 'height', 'loading', 'decoding'], true)) {
            if ($name === 'src') return self::isSafeUrl($value, false);
            if (in_array($name, ['width', 'height'], true)) return preg_match('/^\d{1,5}$/', $value) === 1;
            if ($name === 'loading') return in_array(strtolower($value), ['lazy', 'eager'], true);
            if ($name === 'decoding') return in_array(strtolower($value), ['async', 'sync', 'auto'], true);
            return true;
        }
        if (in_array($tag, ['td', 'th'], true) && in_array($name, ['colspan', 'rowspan', 'headers'], true)) {
            return $name === 'headers'
                ? preg_match('/^[A-Za-z0-9_ -]+$/', $value) === 1
                : preg_match('/^\d{1,3}$/', $value) === 1;
        }
        if ($tag === 'th' && $name === 'scope') {
            return in_array(strtolower($value), ['row', 'col', 'rowgroup', 'colgroup'], true);
        }
        if ($tag === 'col' && $name === 'span') return preg_match('/^\d{1,3}$/', $value) === 1;
        if ($tag === 'blockquote' && $name === 'cite') return self::isSafeUrl($value, true);
        if ($tag === 'ol' && $name === 'start') return preg_match('/^-?\d+$/', $value) === 1;
        if ($tag === 'li' && $name === 'value') return preg_match('/^-?\d+$/', $value) === 1;
        if ($tag === 'li' && $name === 'data-list') {
            return in_array(strtolower($value), ['ordered', 'bullet', 'checked', 'unchecked'], true);
        }

        return false;
    }

    private static function sanitizeClassValue(string $value): string
    {
        return collect(preg_split('/\s+/', trim($value)) ?: [])
            ->filter(fn ($class) => preg_match('/^ql-(?:align-(?:left|center|right|justify)|indent-[1-9]|direction-rtl|size-(?:small|large|huge)|font-(?:serif|monospace)|color-(?:white|red|orange|yellow|green|blue|purple)|bg-(?:black|red|orange|yellow|green|blue|purple))$/', $class) === 1)
            ->unique()
            ->implode(' ');
    }

    private static function sanitizeStyleValue(string $value): string
    {
        $safeDeclarations = [];

        foreach (explode(';', $value) as $declaration) {
            $declaration = trim($declaration);
            if ($declaration === '' || !str_contains($declaration, ':')) continue;

            [$property, $styleValue] = array_map('trim', explode(':', $declaration, 2));
            $property = strtolower($property);
            if ($styleValue === '' || preg_match('/(?:url\s*\(|expression\s*\(|javascript:)/i', $styleValue)) continue;

            if ($property === 'text-align' && preg_match('/^(?:left|right|center|justify|start|end)$/i', $styleValue)) {
                $safeDeclarations[] = $property.': '.strtolower($styleValue);
                continue;
            }
            if ($property === 'direction' && preg_match('/^(?:ltr|rtl)$/i', $styleValue)) {
                $safeDeclarations[] = $property.': '.strtolower($styleValue);
                continue;
            }
            if (in_array($property, ['color', 'background-color'], true) && self::isSafeCssColor($styleValue)) {
                $safeDeclarations[] = $property.': '.$styleValue;
            }
        }

        return implode('; ', array_unique($safeDeclarations));
    }

    private static function isSafeCssColor(string $value): bool
    {
        $value = trim($value);
        return preg_match('/^#[0-9a-f]{3,8}$/i', $value) === 1
            || preg_match('/^(?:rgb|rgba|hsl|hsla)\([\d\s.,%+\-\/]+\)$/i', $value) === 1
            || preg_match('/^[a-z]+$/i', $value) === 1;
    }

    private static function isSafeUrl(string $value, bool $allowContactSchemes): bool
    {
        $value = trim($value);
        if ($value === '' || str_starts_with($value, '/') || str_starts_with($value, '#')) return true;
        if ($allowContactSchemes && preg_match('/^(?:mailto|tel):/i', $value)) return true;
        return filter_var($value, FILTER_VALIDATE_URL) !== false
            && in_array(strtolower((string) parse_url($value, PHP_URL_SCHEME)), ['http', 'https'], true);
    }

    /**
     * Ensure AI generated article content has a usable editor/client structure.
     */
    public static function ensureArticleStructure(string $html, ?string $title = null): string
    {
        $html = trim($html);
        if ($html === '') {
            return '';
        }

        $h2Count = preg_match_all('/<h2\b[^>]*>/i', $html);
        $paragraphCount = preg_match_all('/<p\b[^>]*>/i', $html);

        if ($h2Count >= 3 && $paragraphCount >= 4) {
            return $html;
        }

        $text = html_entity_decode(trim(strip_tags($html)), ENT_QUOTES | ENT_HTML5, 'UTF-8');
        $text = preg_replace('/\s+/u', ' ', $text) ?: '';

        if ($text === '') {
            return $html;
        }

        $sentences = preg_split('/(?<=[.!?。！？])\s+/u', $text, -1, PREG_SPLIT_NO_EMPTY) ?: [];
        if (count($sentences) < 6) {
            $sentences = preg_split('/(?<=\.)\s+|(?<=;)\s+|(?<=:)\s+/u', $text, -1, PREG_SPLIT_NO_EMPTY) ?: [$text];
        }

        $sectionTitles = [
            'Tổng quan nổi bật',
            'Những yếu tố đáng chú ý',
            'Góc nhìn thị trường',
            'Lưu ý khi tìm hiểu',
            'Câu hỏi thường gặp',
        ];

        $chunks = array_chunk($sentences, max(2, (int) ceil(count($sentences) / 4)));
        $structured = '';

        foreach ($chunks as $index => $chunk) {
            $heading = $sectionTitles[$index] ?? 'Nội dung chi tiết';
            $paragraph = trim(implode(' ', $chunk));
            if ($paragraph === '') {
                continue;
            }

            $structured .= '<h2>' . e($heading) . '</h2>';
            $structured .= '<p>' . e($paragraph) . '</p>';
        }

        if (!str_contains(mb_strtolower($structured), 'câu hỏi thường gặp')) {
            $structured .= '<h2>Câu hỏi thường gặp</h2>';
            $structured .= '<h3>Thông tin trong bài viết có phải là thông tin chính thức không?</h3>';
            $structured .= '<p>Nội dung được biên tập theo hướng tham khảo. Vui lòng liên hệ đội ngũ tư vấn để nhận thông tin cập nhật và chính thức nhất.</p>';
        }

        return $structured ?: $html;
    }

    /**
     * Validate OpenAI JSON output matches schema.
     */
    public static function validateJsonSchema(array $data): bool
    {
        $requiredKeys = [
            'title',
            'slug_suggestion',
            'excerpt',
            'seo_title',
            'seo_description',
            'seo_keywords',
            'content_html',
            'image_prompt',
            'cta'
        ];

        foreach ($requiredKeys as $key) {
            if (!isset($data[$key]) || empty($data[$key])) {
                return false;
            }
        }

        return true;
    }

    /**
     * Generate unique slug from suggestion or title.
     */
    public static function generateUniqueSlug(string $title, ?string $suggestion = null): string
    {
        $baseSlug = Str::slug($suggestion ?: $title);
        
        // If slug is empty (e.g. only non-alphanumeric unicode), generate random string
        if (empty($baseSlug)) {
            $baseSlug = 'post-' . Str::random(6);
        }

        $slug = $baseSlug;
        $counter = 2;

        while (Post::where('slug', $slug)->exists()) {
            $slug = $baseSlug . '-' . $counter;
            $counter++;
        }

        return $slug;
    }
}
