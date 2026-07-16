<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\CareerApplication;
use App\Models\CareerJob;
use App\Models\Setting;
use Illuminate\Http\Request;

class CareerSettingsController extends Controller
{
    public function show()
    {
        return response()->json(['success' => true, 'data' => [
            'page_content' => Setting::get('career_page_content', []),
            'settings' => Setting::get('career_settings', []),
            'job_statuses' => CareerJob::STATUS_LABELS, 'application_statuses' => CareerApplication::STATUS_LABELS,
        ]]);
    }

    public function update(Request $request)
    {
        $data = $request->validate([
            'page_content' => 'required|array', 'page_content.eyebrow' => 'nullable|string|max:120',
            'page_content.title' => 'required|string|max:190', 'page_content.description' => 'nullable|string|max:1200',
            'page_content.hero_image' => 'nullable|string|max:2048', 'page_content.benefits' => 'nullable|array|max:6',
            'page_content.benefits.*.title' => 'required|string|max:120', 'page_content.benefits.*.description' => 'nullable|string|max:500',
            'page_content.process' => 'nullable|array|max:8', 'page_content.process.*' => 'string|max:120',
            'page_content.cta_title' => 'nullable|string|max:190', 'page_content.cta_description' => 'nullable|string|max:800',
            'page_content.allow_general_application' => 'boolean', 'page_content.seo_title' => 'nullable|string|max:190',
            'page_content.seo_description' => 'nullable|string|max:500',
            'settings' => 'required|array', 'settings.recipient_emails' => 'nullable|array|max:10', 'settings.recipient_emails.*' => 'email',
            'settings.cc_emails' => 'nullable|array|max:10', 'settings.cc_emails.*' => 'email',
            'settings.bcc_emails' => 'nullable|array|max:10', 'settings.bcc_emails.*' => 'email',
            'settings.cv_required' => 'boolean', 'settings.cv_max_mb' => 'integer|min:1|max:20',
            'settings.cv_extensions' => 'array|min:1', 'settings.cv_extensions.*' => 'in:pdf,doc,docx',
            'settings.retention_days' => 'integer|min:30|max:3650', 'settings.confirmation_email_enabled' => 'boolean',
            'settings.status_email_enabled' => 'boolean', 'settings.status_email_events' => 'array',
            'settings.email_signature' => 'nullable|string|max:2000', 'settings.response_time' => 'nullable|string|max:190',
            'settings.privacy_policy_url' => 'required|string|max:500', 'settings.departments' => 'nullable|array|max:100',
            'settings.departments.*' => 'string|max:120', 'settings.locations' => 'nullable|array|max:100', 'settings.locations.*' => 'string|max:190',
        ]);
        Setting::set('career_page_content', $data['page_content'], 'json');
        Setting::set('career_settings', $data['settings'], 'json');
        return $this->show();
    }
}
