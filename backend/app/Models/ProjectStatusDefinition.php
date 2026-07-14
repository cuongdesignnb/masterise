<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ProjectStatusDefinition extends Model
{
    protected $table = 'project_statuses';

    protected $fillable = [
        'name',
        'slug',
        'description',
        'color_key',
        'sort_order',
        'is_active',
        'is_default',
    ];

    protected function casts(): array
    {
        return [
            'sort_order' => 'integer',
            'is_active' => 'boolean',
            'is_default' => 'boolean',
        ];
    }

    public function projects()
    {
        return $this->hasMany(Project::class, 'project_status', 'slug');
    }

    public function publishedProjects()
    {
        return $this->projects()->where('is_published', true);
    }
}
