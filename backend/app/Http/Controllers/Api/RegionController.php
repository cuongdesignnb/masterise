<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Region;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class RegionController extends Controller
{
    public function index(Request $request)
    {
        $query = Region::query()->withCount('locations');
        $query->withCount([
            'projects as projects_count' => fn ($projectQuery) => $request->boolean('with_count')
                ? $projectQuery->where('is_published', true)
                : $projectQuery,
        ]);

        if ($request->filled('q')) {
            $search = trim((string) $request->q);
            $query->where(function ($regionQuery) use ($search) {
                $regionQuery->where('name', 'like', "%{$search}%")
                    ->orWhere('slug', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%");
            });
        }

        if ($request->has('active') && $request->active !== '') {
            $query->where('is_active', filter_var($request->active, FILTER_VALIDATE_BOOLEAN));
        }

        $query->orderBy('sort_order')->orderBy('name');

        if ($request->boolean('all')) {
            return response()->json(['success' => true, 'data' => $query->get()]);
        }

        $regions = $query->paginate($request->integer('per_page', 10));

        return response()->json([
            'success' => true,
            'data' => $regions->items(),
            'meta' => [
                'current_page' => $regions->currentPage(),
                'last_page' => $regions->lastPage(),
                'per_page' => $regions->perPage(),
                'total' => $regions->total(),
            ],
        ]);
    }

    public function show(string $id)
    {
        $region = Region::query()
            ->withCount('locations')
            ->withCount([
                'projects as projects_count' => fn ($query) => $query->where('is_published', true),
            ])
            ->where('id', $id)
            ->orWhere('slug', $id)
            ->first();

        if (!$region) {
            return response()->json(['success' => false, 'message' => 'Không tìm thấy vùng miền.'], 404);
        }

        return response()->json(['success' => true, 'data' => $region]);
    }

    public function store(Request $request)
    {
        $data = $this->validatedData($request);
        if ($data instanceof \Illuminate\Http\JsonResponse) {
            return $data;
        }

        $data['slug'] = $data['slug'] ?: Str::slug($data['name']);
        $region = Region::create($data);

        return response()->json([
            'success' => true,
            'message' => 'Đã thêm vùng miền thành công.',
            'data' => $region->loadCount(['locations', 'projects']),
        ], 201);
    }

    public function update(Request $request, int $id)
    {
        $region = Region::find($id);
        if (!$region) {
            return response()->json(['success' => false, 'message' => 'Không tìm thấy vùng miền.'], 404);
        }

        $data = $this->validatedData($request, $region);
        if ($data instanceof \Illuminate\Http\JsonResponse) {
            return $data;
        }

        if (empty($data['slug'])) {
            $data['slug'] = $region->slug;
        }
        $region->update($data);

        return response()->json([
            'success' => true,
            'message' => 'Đã cập nhật vùng miền thành công.',
            'data' => $region->fresh()->loadCount(['locations', 'projects']),
        ]);
    }

    public function destroy(int $id)
    {
        $region = Region::withCount(['locations', 'projects'])->find($id);
        if (!$region) {
            return response()->json(['success' => false, 'message' => 'Không tìm thấy vùng miền.'], 404);
        }

        if ($region->locations_count > 0 || $region->projects_count > 0) {
            return response()->json([
                'success' => false,
                'message' => 'Không thể xóa vùng miền đang có vị trí hoặc dự án. Hãy chuyển dữ liệu sang vùng khác trước.',
            ], 409);
        }

        $region->delete();

        return response()->json(['success' => true, 'message' => 'Đã xóa vùng miền thành công.']);
    }

    private function validatedData(Request $request, ?Region $region = null): array|\Illuminate\Http\JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'name' => ['required', 'string', 'max:255'],
            'slug' => [
                'nullable',
                'string',
                'max:255',
                Rule::unique('regions', 'slug')->ignore($region?->id),
            ],
            'description' => ['nullable', 'string'],
            'sort_order' => ['nullable', 'integer'],
            'is_active' => ['nullable', 'boolean'],
        ]);

        $validator->after(function ($validator) use ($request, $region) {
            $name = Str::lower(trim((string) $request->name));
            $duplicate = Region::query()
                ->when($region, fn ($query) => $query->whereKeyNot($region->id))
                ->pluck('name')
                ->contains(fn (string $existingName) => Str::lower(trim($existingName)) === $name);

            if ($duplicate) {
                $validator->errors()->add('name', 'Tên vùng miền đã tồn tại.');
            }
        });

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Dữ liệu vùng miền chưa hợp lệ.',
                'errors' => $validator->errors(),
            ], 422);
        }

        $data = $validator->validated();
        $data['name'] = trim($data['name']);
        $data['slug'] = isset($data['slug']) && trim((string) $data['slug']) !== ''
            ? Str::slug($data['slug'])
            : null;
        $data['sort_order'] = (int) ($data['sort_order'] ?? 0);
        $data['is_active'] = array_key_exists('is_active', $data) ? (bool) $data['is_active'] : true;

        return $data;
    }
}
