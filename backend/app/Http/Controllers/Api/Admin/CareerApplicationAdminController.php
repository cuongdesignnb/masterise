<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Jobs\SendCareerApplicationEmails;
use App\Models\CareerApplication;
use App\Models\CareerApplicationActivity;
use App\Models\Setting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;

class CareerApplicationAdminController extends Controller
{
    public function index(Request $request)
    {
        $query = CareerApplication::with('job:id,title,code');
        if ($q = $request->string('q')->trim()->toString()) {
            $query->where(fn ($b) => $b->where('full_name', 'like', "%{$q}%")->orWhere('email', 'like', "%{$q}%")
                ->orWhere('phone', 'like', "%{$q}%")->orWhere('application_code', 'like', "%{$q}%"));
        }
        if ($request->filled('job_id')) $query->where('career_job_id', $request->integer('job_id'));
        if ($request->filled('status')) $query->where('status', $request->input('status'));
        if ($request->filled('from')) $query->whereDate('created_at', '>=', $request->input('from'));
        if ($request->filled('to')) $query->whereDate('created_at', '<=', $request->input('to'));
        $p = $query->latest()->paginate(min(100, max(1, $request->integer('per_page', 20))));
        return response()->json(['success' => true, 'data' => $p->items(), 'meta' => ['current_page' => $p->currentPage(), 'last_page' => $p->lastPage(), 'per_page' => $p->perPage(), 'total' => $p->total()]]);
    }

    public function show(CareerApplication $application)
    {
        $application->makeVisible(['ip_address']);
        return response()->json(['success' => true, 'data' => $application->load(['job', 'activities.user:id,name'])]);
    }

    public function update(Request $request, CareerApplication $application)
    {
        $data = $request->validate(['status' => ['required', Rule::in(CareerApplication::STATUSES)], 'note' => 'nullable|string|max:5000', 'send_email' => 'nullable|boolean']);
        $old = $application->status;
        $application->update(['status' => $data['status'], 'admin_notes' => $data['note'] ?? $application->admin_notes]);
        CareerApplicationActivity::create(['application_id' => $application->id, 'user_id' => $request->user()->id,
            'action' => $old === $data['status'] ? 'note_added' : 'status_changed', 'old_status' => $old,
            'new_status' => $data['status'], 'note' => $data['note'] ?? null]);
        $careerSettings = Setting::get('career_settings', []);
        if (($data['send_email'] ?? false) && ($careerSettings['status_email_enabled'] ?? false)
            && in_array($data['status'], $careerSettings['status_email_events'] ?? [], true)) {
            SendCareerApplicationEmails::dispatch($application->id, 'status');
        }
        return response()->json(['success' => true, 'data' => $application->fresh()->load(['job', 'activities.user:id,name'])]);
    }

    public function downloadCv(CareerApplication $application)
    {
        abort_unless($application->cv_path && Storage::disk('local')->exists($application->cv_path), 404);
        return Storage::disk('local')->download($application->cv_path, $application->cv_original_name ?: 'CV-'.$application->application_code);
    }

    public function resend(CareerApplication $application)
    {
        $application->update(['email_error' => null]);
        SendCareerApplicationEmails::dispatch($application->id);
        return response()->json(['success' => true, 'message' => 'Đã đưa email vào hàng đợi gửi lại.']);
    }

    public function destroy(CareerApplication $application)
    {
        if ($application->cv_path) Storage::disk('local')->delete($application->cv_path);
        $application->delete();
        return response()->json(['success' => true, 'message' => 'Đã xóa hồ sơ ứng viên.']);
    }
}
