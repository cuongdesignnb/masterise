<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ProjectVrHotspot extends Model
{
    use HasFactory;

    protected $fillable = [
        'scene_id',
        'project_id',
        'type',
        'title',
        'description',
        'yaw',
        'pitch',
        'icon',
        'target_scene_id',
        'media_url',
        'cta_type',
        'cta_label',
        'cta_url',
        'metadata',
        'sort_order',
        'is_active',
    ];

    protected $casts = [
        'yaw' => 'float',
        'pitch' => 'float',
        'metadata' => 'json',
        'is_active' => 'boolean',
        'sort_order' => 'integer',
    ];

    public function scene()
    {
        return $this->belongsTo(ProjectVrScene::class, 'scene_id');
    }

    public function project()
    {
        return $this->belongsTo(Project::class);
    }

    public function targetScene()
    {
        return $this->belongsTo(ProjectVrScene::class, 'target_scene_id');
    }
}
