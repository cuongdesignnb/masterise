<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CareerApplicationActivity extends Model
{
    public $timestamps = false;
    const UPDATED_AT = null;
    protected $guarded = [];
    protected $casts = ['created_at' => 'datetime'];
    public function application() { return $this->belongsTo(CareerApplication::class, 'application_id'); }
    public function user() { return $this->belongsTo(User::class); }
}
