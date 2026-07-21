<?php

namespace App\Http\Controllers\Api\Admin;

use App\Helpers\AiContentHelper;
use App\Http\Controllers\Controller;
use App\Models\CareerJob;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class CareerJobAdminController extends Controller
{
    public function index(Request $request)
    {
        $query = CareerJob::withCount('applications');
        if ($q = $request->string('q')->trim()->toString()) $query->where(fn ($b) => $b->where('title', 'like', "%{$q}%")->orWhere('code', 'like', "%{$q}%"));
        foreach (['status', 'department', 'location'] as $filter) if ($request->filled($filter)) $query->where($filter, $request->input($filter));
        $p = $query->latest()->paginate(min(50, max(1, $request->integer('per_page', 15))));
        return response()->json(['success' => true, 'data' => $p->items(), 'meta' => ['current_page' => $p->currentPage(), 'last_page' => $p->lastPage(), 'per_page' => $p->perPage(), 'total' => $p->total()]]);
    }

    public function show(CareerJob $job) { return response()->json(['success' => true, 'data' => $job->loadCount('applications')]); }
    public function store(Request $request) { $job = CareerJob::create($this->payload($request)); return response()->json(['success' => true, 'data' => $job], 201); }
    public function update(Request $request, CareerJob $job) { $job->update($this->payload($request, $job)); return response()->json(['success' => true, 'data' => $job->fresh()]); }
    public function destroy(CareerJob $job) { $job->delete(); return response()->json(['success' => true, 'message' => 'Đã xóa tin tuyển dụng.']); }
    public function duplicate(CareerJob $job)
    {
        $copy = $job->replicate(); $copy->title .= ' - Bản sao'; $copy->slug = $job->slug.'-'.Str::lower(Str::random(5));
        $copy->code = $job->code.'-'.strtoupper(Str::random(3)); $copy->status = 'draft'; $copy->is_published = false; $copy->published_at = null; $copy->save();
        return response()->json(['success' => true, 'data' => $copy], 201);
    }

    private function payload(Request $request, ?CareerJob $job = null): array
    {
        $data = $request->validate([
            'title' => 'required|string|max:190', 'slug' => ['nullable', 'string', 'max:190', Rule::unique('career_jobs')->ignore($job?->id)],
            'code' => ['required', 'string', 'max:50', Rule::unique('career_jobs')->ignore($job?->id)],
            'department' => 'required|string|max:120', 'location' => 'required|string|max:190',
            'employment_type' => ['required', Rule::in(array_keys(CareerJob::EMPLOYMENT_LABELS))],
            'workplace_type' => 'nullable|string|max:100', 'experience_level' => 'nullable|string|max:100',
            'salary_min' => 'nullable|numeric|min:0', 'salary_max' => 'nullable|numeric|gte:salary_min',
            'salary_currency' => 'nullable|string|max:8', 'salary_text' => 'nullable|string|max:190',
            'vacancies' => 'required|integer|min:1|max:999', 'short_description' => 'nullable|string|max:1000',
            'description' => 'nullable|string', 'responsibilities' => 'nullable|string', 'requirements' => 'nullable|string',
            'benefits' => 'nullable|string', 'working_time' => 'nullable|string', 'additional_information' => 'nullable|string',
            'application_deadline' => 'nullable|date', 'published_at' => 'nullable|date', 'closed_at' => 'nullable|date',
            'status' => ['required', Rule::in(CareerJob::STATUSES)], 'is_featured' => 'boolean', 'is_published' => 'boolean',
            'sort_order' => 'integer|min:0', 'thumbnail' => 'nullable|string|max:2048', 'banner_image' => 'nullable|string|max:2048',
            'seo_title' => 'nullable|string|max:190', 'seo_description' => 'nullable|string|max:500', 'seo_keywords' => 'nullable|string|max:500',
            'schema_street_address' => 'nullable|string|max:255', 'schema_locality' => 'nullable|string|max:120',
            'schema_region' => 'nullable|string|max:120', 'schema_postal_code' => 'nullable|string|max:20',
            'schema_country' => 'nullable|string|size:2', 'schema_applicant_country' => 'nullable|string|size:2',
            'schema_salary_unit' => ['nullable', Rule::in(['MONTH', 'YEAR', 'WEEK', 'DAY', 'HOUR'])],
            'schema_direct_apply' => 'sometimes|boolean',
        ]);
        $data['slug'] = Str::slug($data['slug'] ?: $data['title']);
        foreach (['description', 'responsibilities', 'requirements', 'benefits', 'working_time', 'additional_information'] as $field) {
            if (isset($data[$field])) $data[$field] = AiContentHelper::sanitizeHtml($data[$field]);
        }
        if ($data['status'] === 'published') { $data['is_published'] = true; $data['published_at'] ??= now(); }
        if (in_array($data['status'], ['closed', 'archived'], true)) { $data['is_published'] = false; $data['closed_at'] ??= now(); }
        return $data;
    }
}
