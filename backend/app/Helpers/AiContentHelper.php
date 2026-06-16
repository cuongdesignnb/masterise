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
        'h2', 'h3', 'h4', 'h5', 'h6',
        'p', 'br', 'hr',
        'ul', 'ol', 'li',
        'strong', 'em', 'span', 'b', 'i',
        'a', 'blockquote',
        'table', 'thead', 'tbody', 'tr', 'th', 'td',
        'img'
    ];

    /**
     * Sanitize HTML content using DOMDocument.
     * Removes scripts, styles, iframes, and javascript events.
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

                // Remove dangerous attributes (like onclick, onload, etc.)
                $attrsToRemove = [];
                if ($node->hasAttributes()) {
                    foreach ($node->attributes as $attr) {
                        $name = strtolower($attr->name);
                        // Strip anything starting with "on" (event listeners) or containing "javascript:"
                        if (str_starts_with($name, 'on') || str_contains(strtolower($attr->value), 'javascript:')) {
                            $attrsToRemove[] = $attr->name;
                        }
                    }
                    foreach ($attrsToRemove as $attrName) {
                        $node->removeAttribute($attrName);
                    }
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
