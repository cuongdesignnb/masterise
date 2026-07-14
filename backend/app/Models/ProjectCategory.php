<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ProjectCategory extends Model
{
    public const TYPE_PROJECT = 'project_type';

    public const TYPE_COLLECTION = 'collection';

    protected $fillable = [
        'name',
        'slug',
        'description',
        'taxonomy_type',
    ];

    public function projects()
    {
        return $this->belongsToMany(Project::class, 'project_category_project');
    }
}
