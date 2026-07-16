<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class CareerApplication extends Model
{
    use HasFactory, SoftDeletes;

    protected $guarded = [];
    protected $hidden = ['cv_path', 'ip_address', 'user_agent'];
    protected $casts = [
        'available_from' => 'date', 'consent_at' => 'datetime',
        'notification_sent_at' => 'datetime', 'confirmation_sent_at' => 'datetime',
        'cv_size' => 'integer',
    ];
    protected $appends = ['status_label'];

    public const STATUSES = ['new', 'reviewing', 'shortlisted', 'interviewing', 'offered', 'hired', 'rejected', 'archived'];
    public const STATUS_LABELS = [
        'new' => 'Mới', 'reviewing' => 'Đang xem xét', 'shortlisted' => 'Đã chọn sơ bộ',
        'interviewing' => 'Đang phỏng vấn', 'offered' => 'Đã gửi đề nghị', 'hired' => 'Đã tuyển',
        'rejected' => 'Không phù hợp', 'archived' => 'Lưu trữ',
    ];

    public function job() { return $this->belongsTo(CareerJob::class, 'career_job_id'); }
    public function activities() { return $this->hasMany(CareerApplicationActivity::class, 'application_id')->latest('created_at'); }
    public function getStatusLabelAttribute(): string { return self::STATUS_LABELS[$this->status] ?? $this->status; }
}
