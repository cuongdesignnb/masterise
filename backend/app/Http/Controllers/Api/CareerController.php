<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Jobs\SendCareerApplicationEmails;
use App\Models\CareerApplication;
use App\Models\CareerApplicationActivity;
use App\Models\CareerJob;
use App\Models\Setting;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

class CareerController extends Controller
{
    public function index(Request $request)
    {
        $validated = $request->validate([
            'q' => 'nullable|string|max:100', 'department' => 'nullable|string|max:100',
            'location' => 'nullable|string|max:150', 'employment_type' => 'nullable|string|max:50',
            'sort' => ['nullable', Rule::in(['newest', 'deadline'])],
            'page' => 'nullable|integer|min:1', 'per_page' => 'nullable|integer|min:1|max:24',
        ]);

        $query = CareerJob::query()->visible();
        if ($q = ($validated['q'] ?? null)) {
            $query->where(fn (Builder $builder) => $builder->where('title', 'like', "%{$q}%")
                ->orWhere('code', 'like', "%{$q}%")->orWhere('short_description', 'like', "%{$q}%"));
        }
        foreach (['department', 'location', 'employment_type'] as $filter) {
            if (!empty($validated[$filter])) $query->where($filter, $validated[$filter]);
        }
        $query->orderByDesc('is_featured')->orderBy('sort_order');
        ($validated['sort'] ?? 'newest') === 'deadline'
            ? $query->orderByRaw('application_deadline IS NULL')->orderBy('application_deadline')
            : $query->latest('published_at');

        $paginator = $query->paginate($validated['per_page'] ?? 9);
        return response()->json(['success' => true, 'data' => $paginator->items(), 'meta' => [
            'current_page' => $paginator->currentPage(), 'last_page' => $paginator->lastPage(),
            'per_page' => $paginator->perPage(), 'total' => $paginator->total(),
        ]]);
    }

    public function show(string $slug)
    {
        $job = CareerJob::query()->where('slug', $slug)->visible()->firstOrFail();
        $related = CareerJob::query()->visible()->whereKeyNot($job->id)
            ->where(fn (Builder $q) => $q->where('department', $job->department)->orWhere('location', $job->location))
            ->orderByRaw('department = ? desc', [$job->department])->limit(4)->get();
        return response()->json(['success' => true, 'data' => ['job' => $job, 'related' => $related]]);
    }

    public function options()
    {
        $base = CareerJob::query()->visible();
        $page = Setting::get('career_page_content', []);
        $settings = Setting::get('career_settings', []);
        return response()->json(['success' => true, 'data' => [
            'departments' => (clone $base)->distinct()->orderBy('department')->pluck('department')->values(),
            'locations' => (clone $base)->distinct()->orderBy('location')->pluck('location')->values(),
            'employment_types' => collect(CareerJob::EMPLOYMENT_LABELS)->map(fn ($label, $value) => compact('value', 'label'))->values(),
            'page_content' => $page,
            'stats' => [
                'open_jobs' => (clone $base)->count(),
                'departments' => (clone $base)->distinct()->count('department'),
                'locations' => (clone $base)->distinct()->count('location'),
            ],
            'application_rules' => [
                'cv_required' => (bool) ($settings['cv_required'] ?? true),
                'cv_max_mb' => (int) ($settings['cv_max_mb'] ?? 10),
                'cv_extensions' => array_values(array_intersect($settings['cv_extensions'] ?? ['pdf', 'doc', 'docx'], ['pdf', 'doc', 'docx'])),
                'privacy_policy_url' => $settings['privacy_policy_url'] ?? '/chuyen-trang/chinh-sach-bao-mat',
            ],
        ]]);
    }

    public function apply(Request $request, CareerJob $job)
    {
        if (!$job->accepting_applications) {
            return response()->json(['success' => false, 'message' => 'Vị trí này hiện không nhận hồ sơ.'], 422);
        }
        return $this->storeApplication($request, $job);
    }

    public function applyGeneral(Request $request)
    {
        if (!data_get(Setting::get('career_page_content', []), 'allow_general_application', false)) {
            return response()->json(['success' => false, 'message' => 'Hệ thống hiện chưa nhận hồ sơ tự do.'], 422);
        }
        return $this->storeApplication($request, null);
    }

    private function storeApplication(Request $request, ?CareerJob $job)
    {
        $settings = Setting::get('career_settings', []);
        $maxMb = max(1, min(20, (int) ($settings['cv_max_mb'] ?? 10)));
        $cvRequired = (bool) ($settings['cv_required'] ?? true);
        $allowedExtensions = array_values(array_intersect($settings['cv_extensions'] ?? ['pdf', 'doc', 'docx'], ['pdf', 'doc', 'docx']));
        $allowedMimes = [
            'application/pdf', 'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'application/zip', 'application/octet-stream',
        ];

        $validated = $request->validate([
            'full_name' => 'required|string|min:2|max:120', 'email' => 'required|email:rfc|max:190',
            'phone' => ['required', 'string', 'max:30', 'regex:/^[0-9+() .-]{8,20}$/'],
            'cover_letter' => 'nullable|string|max:5000', 'linkedin_url' => 'nullable|url:http,https|max:500',
            'portfolio_url' => 'nullable|url:http,https|max:500', 'experience_summary' => 'nullable|string|max:3000',
            'expected_salary' => 'nullable|string|max:100', 'available_from' => 'nullable|date',
            'consent' => 'accepted', 'website' => 'nullable|max:0',
            'cv' => [Rule::requiredIf($cvRequired), 'nullable', 'file', 'max:'.($maxMb * 1024),
                'extensions:'.implode(',', $allowedExtensions), 'mimetypes:'.implode(',', $allowedMimes)],
            'source' => 'nullable|string|max:100', 'utm_source' => 'nullable|string|max:150',
            'utm_medium' => 'nullable|string|max:150', 'utm_campaign' => 'nullable|string|max:150',
        ]);

        $duplicate = CareerApplication::query()->where('career_job_id', $job?->id)
            ->where(fn (Builder $q) => $q->where('email', $validated['email'])->orWhere('phone', $validated['phone']))
            ->where('created_at', '>=', now()->subHour())->exists();
        if ($duplicate) throw ValidationException::withMessages(['email' => 'Hồ sơ này vừa được gửi. Vui lòng thử lại sau.']);

        $path = null;
        try {
            if ($request->hasFile('cv')) {
                $file = $request->file('cv');
                $extension = strtolower($file->getClientOriginalExtension());
                $path = $file->storeAs('career-cvs', (string) Str::ulid().'.'.$extension, 'local');
                $validated += ['cv_original_name' => $file->getClientOriginalName(), 'cv_path' => $path,
                    'cv_mime' => $file->getMimeType(), 'cv_size' => $file->getSize()];
            }

            $application = DB::transaction(function () use ($validated, $job, $request) {
                $application = CareerApplication::create([
                    ...collect($validated)->except(['cv', 'consent', 'website'])->all(),
                    'application_code' => $this->nextApplicationCode(), 'career_job_id' => $job?->id,
                    'status' => 'new', 'source' => $validated['source'] ?? 'website',
                    'ip_address' => $request->ip(), 'user_agent' => Str::limit((string) $request->userAgent(), 1000),
                    'consent_at' => now(),
                ]);
                CareerApplicationActivity::create(['application_id' => $application->id, 'action' => 'submitted', 'new_status' => 'new']);
                return $application;
            });
        } catch (\Throwable $e) {
            if ($path) Storage::disk('local')->delete($path);
            throw $e;
        }

        SendCareerApplicationEmails::dispatch($application->id)->afterResponse();
        return response()->json(['success' => true, 'message' => 'Hồ sơ đã được tiếp nhận.', 'data' => [
            'application_code' => $application->application_code,
            'confirmation_email_queued' => (bool) ($settings['confirmation_email_enabled'] ?? true),
        ]], 201);
    }

    private function nextApplicationCode(): string
    {
        do { $code = 'UV-'.now()->format('ymd').'-'.strtoupper(Str::random(6)); }
        while (CareerApplication::where('application_code', $code)->exists());
        return $code;
    }
}
