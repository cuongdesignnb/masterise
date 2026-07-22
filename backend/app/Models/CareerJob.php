<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class CareerJob extends Model
{
    use HasFactory, SoftDeletes;

    protected $guarded = [];

    protected $casts = [
        'salary_min' => 'decimal:2', 'salary_max' => 'decimal:2',
        'vacancies' => 'integer', 'sort_order' => 'integer',
        'is_featured' => 'boolean', 'is_published' => 'boolean',
        'application_deadline' => 'datetime', 'published_at' => 'datetime', 'closed_at' => 'datetime',
        'schema_direct_apply' => 'boolean',
    ];

    protected $appends = ['status_label', 'employment_type_label', 'accepting_applications'];

    public const STATUSES = ['draft', 'scheduled', 'published', 'closed', 'archived'];
    public const STATUS_LABELS = [
        'draft' => 'Bản nháp', 'scheduled' => 'Đã lên lịch', 'published' => 'Đang tuyển',
        'closed' => 'Đã đóng', 'archived' => 'Lưu trữ',
    ];
    public const EMPLOYMENT_LABELS = [
        'full_time' => 'Toàn thời gian', 'part_time' => 'Bán thời gian',
        'contract' => 'Hợp đồng', 'internship' => 'Thực tập', 'freelance' => 'Cộng tác viên',
    ];

    public function applications() { return $this->hasMany(CareerApplication::class); }

    public function scopeVisible(Builder $query): Builder
    {
        return $query->where('is_published', true)->where('status', 'published')
            ->where(fn (Builder $q) => $q->whereNull('published_at')->orWhere('published_at', '<=', now()))
            ->where(fn (Builder $q) => $q->whereNull('application_deadline')->orWhere('application_deadline', '>=', now()));
    }

    public function getStatusLabelAttribute(): string { return self::STATUS_LABELS[$this->status] ?? $this->status; }
    public function getEmploymentTypeLabelAttribute(): string { return self::EMPLOYMENT_LABELS[$this->employment_type] ?? $this->employment_type; }
    public function getAcceptingApplicationsAttribute(): bool
    {
        return $this->is_published && $this->status === 'published'
            && (!$this->published_at || $this->published_at->lte(now()))
            && (!$this->application_deadline || $this->application_deadline->gte(now()));
    }
}
