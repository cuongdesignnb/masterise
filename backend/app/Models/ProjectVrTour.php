<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ProjectVrTour extends Model
{
    use HasFactory;

    protected $fillable = [
        'project_id',
        'title',
        'description',
        'cover_image',
        'is_active',
        'sort_order',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'sort_order' => 'integer',
    ];

    public function project()
    {
        return $this->belongsTo(Project::class);
    }

    public function scenes()
    {
        return $this->hasMany(ProjectVrScene::class, 'tour_id')->orderBy('sort_order');
    }
}
