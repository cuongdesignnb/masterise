<?php

namespace Tests\Unit;

use App\Helpers\AiContentHelper;
use PHPUnit\Framework\TestCase;

class AiContentHelperTableTest extends TestCase
{
    public function test_sanitizer_preserves_rich_table_structure_and_safe_attributes(): void
    {
        $html = <<<'HTML'
<h3>Thông tin tổng quan Masteri Grand Coast</h3>
<table style="border: 0" onclick="alert(1)">
  <caption>Tổng quan dự án</caption>
  <colgroup><col span="2"></colgroup>
  <thead><tr><th scope="col">Hạng mục</th><th scope="col">Thông tin</th></tr></thead>
  <tbody>
    <tr><td rowspan="2"><em>Tên dự án</em></td><td><strong>Masteri Grand Coast</strong></td></tr>
    <tr><td colspan="1" headers="project-name">Masterise Homes</td></tr>
  </tbody>
  <tfoot><tr><td colspan="2">Tiếng Việt đầy đủ</td></tr></tfoot>
</table>
<a href="javascript:alert(1)">Liên kết xấu</a><script>alert(1)</script>
HTML;

        $clean = AiContentHelper::sanitizeHtml($html);

        foreach (['table', 'caption', 'colgroup', 'col', 'thead', 'tbody', 'tfoot', 'tr', 'th', 'td', 'strong', 'em'] as $tag) {
            $this->assertStringContainsString("<{$tag}", $clean);
        }
        foreach (['span="2"', 'scope="col"', 'rowspan="2"', 'colspan="1"', 'headers="project-name"'] as $attribute) {
            $this->assertStringContainsString($attribute, $clean);
        }
        $this->assertStringContainsString('Tiếng Việt đầy đủ', html_entity_decode($clean, ENT_QUOTES | ENT_HTML5, 'UTF-8'));
        $this->assertStringNotContainsString('style=', $clean);
        $this->assertStringNotContainsString('onclick=', $clean);
        $this->assertStringNotContainsString('javascript:', $clean);
        $this->assertStringNotContainsString('<script', $clean);
    }
}
