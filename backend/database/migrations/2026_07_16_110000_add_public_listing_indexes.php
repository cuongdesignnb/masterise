<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        $this->addIndex('projects', ['is_published', 'created_at'], 'projects_public_latest_index');
        $this->addIndex('projects', ['is_published', 'is_featured', 'is_hot', 'sort_order'], 'projects_public_featured_index');
        $this->addIndex('projects', ['is_published', 'price_min'], 'projects_public_price_index');
        $this->addIndex('posts', ['status', 'post_type', 'published_at'], 'posts_public_type_latest_index');
        $this->addIndex('posts', ['status', 'is_featured', 'published_at'], 'posts_public_featured_index');
    }

    public function down(): void
    {
        $this->dropIndex('projects', 'projects_public_latest_index');
        $this->dropIndex('projects', 'projects_public_featured_index');
        $this->dropIndex('projects', 'projects_public_price_index');
        $this->dropIndex('posts', 'posts_public_type_latest_index');
        $this->dropIndex('posts', 'posts_public_featured_index');
    }

    private function addIndex(string $table, array $columns, string $name): void
    {
        if ($this->hasIndex($table, $name)) return;
        Schema::table($table, fn (Blueprint $blueprint) => $blueprint->index($columns, $name));
    }

    private function dropIndex(string $table, string $name): void
    {
        if (!$this->hasIndex($table, $name)) return;
        Schema::table($table, fn (Blueprint $blueprint) => $blueprint->dropIndex($name));
    }

    private function hasIndex(string $table, string $name): bool
    {
        return collect(Schema::getIndexes($table))->contains(fn (array $index) => ($index['name'] ?? null) === $name);
    }
};
