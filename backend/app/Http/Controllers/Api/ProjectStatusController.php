<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ProjectStatusDefinition;
use App\Support\PublicContentCache;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class ProjectStatusController extends Controller
{
    public const COLOR_KEYS = [
        'amber', 'emerald', 'rose', 'sky', 'stone', 'violet', 'blue', 'orange',
    ];

    public function index(Request $request)
    {
        $statuses = PublicContentCache::remember('projects.taxonomy', ['type' => 'statuses'], 900, fn () =>
            ProjectStatusDefinition::query()
                ->where('is_active', true)
                ->withCount(['publishedProjects as projects_count'])
                ->orderBy('sort_order')
                ->orderBy('name')
                ->get()
        );

        return response()->json(['success' => true, 'data' => $statuses])
            ->header('Cache-Control', 'public, max-age=300, s-maxage=900');
    }

    public function adminIndex()
    {
        $statuses = ProjectStatusDefinition::query()
            ->withCount([
                'projects as projects_count',
                'publishedProjects as published_projects_count',
            ])
            ->orderBy('sort_order')
            ->orderBy('name')
            ->get();

        return $this->noStore(response()->json(['success' => true, 'data' => $statuses]));
    }

    public function store(Request $request)
    {
        $request->merge([
            'name' => trim((string) $request->input('name')),
            'slug' => Str::slug((string) ($request->input('slug') ?: $request->input('name')), '_'),
        ]);

        $validator = Validator::make($request->all(), $this->rules());
        if ($validator->fails()) {
            return $this->validationError($validator->errors()->toArray());
        }

        $data = $this->normalized($validator->validated());
        $status = DB::transaction(function () use ($data) {
            if ($data['is_default']) {
                ProjectStatusDefinition::query()->update(['is_default' => false]);
            }

            if (!ProjectStatusDefinition::query()->exists()) {
                $data['is_default'] = true;
            }

            return ProjectStatusDefinition::create($data);
        });

        return $this->noStore(response()->json([
            'success' => true,
            'message' => 'Đã tạo trạng thái dự án.',
            'data' => $this->withCounts($status),
        ], 201));
    }

    public function update(Request $request, int $id)
    {
        $status = ProjectStatusDefinition::find($id);
        if (!$status) {
            return response()->json(['success' => false, 'message' => 'Không tìm thấy trạng thái dự án.'], 404);
        }

        $request->merge([
            'name' => trim((string) $request->input('name')),
            'slug' => Str::slug((string) ($request->input('slug') ?: $status->slug), '_'),
        ]);

        $validator = Validator::make($request->all(), $this->rules($status));
        if ($validator->fails()) {
            return $this->validationError($validator->errors()->toArray());
        }

        $data = $this->normalized($validator->validated());
        $projectsCount = $status->projects()->count();
        $publishedCount = $status->publishedProjects()->count();

        if ($data['slug'] !== $status->slug && $projectsCount > 0) {
            return $this->validationError([
                'slug' => ["Không thể đổi slug vì có {$projectsCount} dự án đang sử dụng trạng thái này."],
            ]);
        }

        if (!$data['is_active'] && $publishedCount > 0) {
            return response()->json([
                'success' => false,
                'message' => "Không thể vô hiệu hóa vì có {$publishedCount} dự án đã xuất bản đang sử dụng trạng thái này.",
            ], 409);
        }

        if ($status->is_default && !$data['is_default']) {
            return response()->json([
                'success' => false,
                'message' => 'Hãy chọn một trạng thái mặc định khác trước khi bỏ trạng thái mặc định hiện tại.',
            ], 409);
        }

        DB::transaction(function () use ($status, $data) {
            if ($data['is_default']) {
                ProjectStatusDefinition::query()->whereKeyNot($status->id)->update(['is_default' => false]);
            }
            $status->update($data);
        });

        return $this->noStore(response()->json([
            'success' => true,
            'message' => 'Đã cập nhật trạng thái dự án.',
            'data' => $this->withCounts($status->fresh()),
        ]));
    }

    public function destroy(int $id)
    {
        $status = ProjectStatusDefinition::find($id);
        if (!$status) {
            return response()->json(['success' => false, 'message' => 'Không tìm thấy trạng thái dự án.'], 404);
        }

        $projectsCount = $status->projects()->count();
        if ($projectsCount > 0) {
            return response()->json([
                'success' => false,
                'message' => "Không thể xóa vì có {$projectsCount} dự án đang sử dụng trạng thái này.",
                'projects_count' => $projectsCount,
            ], 409);
        }

        if ($status->is_default) {
            return response()->json([
                'success' => false,
                'message' => 'Không thể xóa trạng thái mặc định. Hãy chọn trạng thái mặc định khác trước.',
            ], 409);
        }

        $status->delete();

        return $this->noStore(response()->json([
            'success' => true,
            'message' => 'Đã xóa trạng thái dự án.',
        ]));
    }

    private function rules(?ProjectStatusDefinition $status = null): array
    {
        return [
            'name' => ['required', 'string', 'max:255', Rule::unique('project_statuses', 'name')->ignore($status?->id)],
            'slug' => ['required', 'string', 'max:100', 'regex:/^[a-z0-9]+(?:[_-][a-z0-9]+)*$/', Rule::unique('project_statuses', 'slug')->ignore($status?->id)],
            'description' => ['nullable', 'string'],
            'color_key' => ['required', Rule::in(self::COLOR_KEYS)],
            'sort_order' => ['nullable', 'integer'],
            'is_active' => ['nullable', 'boolean'],
            'is_default' => ['nullable', 'boolean'],
        ];
    }

    private function normalized(array $data): array
    {
        return [
            'name' => trim($data['name']),
            'slug' => Str::slug($data['slug'], '_'),
            'description' => $data['description'] ?? null,
            'color_key' => $data['color_key'],
            'sort_order' => (int) ($data['sort_order'] ?? 0),
            'is_active' => array_key_exists('is_active', $data) ? (bool) $data['is_active'] : true,
            'is_default' => array_key_exists('is_default', $data) ? (bool) $data['is_default'] : false,
        ];
    }

    private function validationError(array $errors)
    {
        return response()->json([
            'success' => false,
            'message' => 'Dữ liệu trạng thái dự án chưa hợp lệ.',
            'errors' => $errors,
        ], 422);
    }

    private function withCounts(ProjectStatusDefinition $status): ProjectStatusDefinition
    {
        return $status->loadCount([
            'projects as projects_count',
            'publishedProjects as published_projects_count',
        ]);
    }

    private function noStore($response)
    {
        return $response
            ->header('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0')
            ->header('Pragma', 'no-cache');
    }
}
