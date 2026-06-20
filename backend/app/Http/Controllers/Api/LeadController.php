<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Lead;
use App\Models\LeadNote;
use App\Models\LeadActivity;
use App\Models\LeadAssignment;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\RateLimiter;
use Carbon\Carbon;

class LeadController extends Controller
{
    /**
     * Helper to normalize Vietnamese phone number.
     */
    private function normalizePhone($phone)
    {
        $phone = preg_replace('/\D/', '', $phone); // Strip non-digits
        if (str_starts_with($phone, '84')) {
            $phone = '0' . substr($phone, 2);
        }
        return $phone;
    }

    /**
     * Calculate and update score & temperature for a Lead.
     */
    private function updateLeadScoreAndTemperature(Lead $lead)
    {
        // Define score rules
        $rules = [
            'submit_price_form' => 20,
            'submit_schedule_form' => 35,
            'click_hotline' => 25,
            'click_zalo' => 20,
            'view_pricing' => 10,
            'view_legal' => 10,
            'view_floorplan' => 10,
            'download_brochure' => 15,
            'return_visit' => 10,
            'open_vr360' => 10,
            'view_vr_scene' => 5,
            'view_vr_scene_over_30s' => 10,
            'click_vr_hotspot' => 5,
            'click_vr_cta' => 20,
            'click_price_form_from_vr' => 20,
            'click_schedule_visit_from_vr' => 35,
        ];

        // Sum points from logged activities
        $score = 0;
        foreach ($rules as $type => $points) {
            $count = $lead->activities()->where('type', $type)->count();
            $score += $count * $points;
        }

        // Add points for fields
        if ($lead->budget_range) {
            $score += 15; // budget_matched
        }
        if ($lead->demand_type === 'Mua ngay' || $lead->demand_type === 'Đầu tư') {
            $score += 20; // demand_buy_now
        }

        // Apply temperature tags
        $temperature = 'cold';
        if ($score > 80) {
            $temperature = 'very_hot';
        } elseif ($score > 60) {
            $temperature = 'hot';
        } elseif ($score > 30) {
            $temperature = 'warm';
        }

        $lead->update([
            'score' => $score,
            'temperature' => $temperature
        ]);
    }

    /**
     * Public Submit Lead Form API.
     */
    public function submit(Request $request)
    {
        // 1. Anti-spam: Rate limit by real client IP (Temporarily disabled for testing)
        // $ip = $request->header('X-Real-IP') ?: ($request->header('X-Forwarded-For') ?: $request->ip());
        // $rateLimitKey = 'submit-lead:' . $ip;
        // if (RateLimiter::tooManyAttempts($rateLimitKey, 5)) {
        //     return response()->json([
        //         'success' => false,
        //         'message' => 'Bạn đã gửi yêu cầu quá nhiều lần. Vui lòng thử lại sau 5 phút.'
        //     ], 429);
        // }
        // RateLimiter::hit($rateLimitKey, 300);

        // 2. Anti-spam: Honeypot field check
        if ($request->has('website_url') && !empty($request->website_url)) {
            return response()->json([
                'success' => false,
                'message' => 'Spam detected'
            ], 400);
        }

        // 3. Validation (Vietnamese mobile phone validation - relaxed for testing)
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'phone' => ['required', 'string', 'max:20', function ($attribute, $value, $fail) {
                $normalized = $this->normalizePhone($value);
                if (!preg_match('/^0[0-9]{8,10}$/', $normalized)) {
                    $fail('Số điện thoại không hợp lệ (phải bắt đầu bằng số 0 và gồm 9-11 chữ số).');
                }
            }],
            'email' => 'nullable|email|max:255',
            'type' => 'nullable|string|in:contact,consultation,download_brochure,newsletter,schedule_visit,finance_consult',
            'message' => 'nullable|string',
            'project_id' => 'nullable|exists:projects,id',
            'user_id' => 'nullable|exists:users,id',
            'demand_type' => 'nullable|string|max:100',
            'budget_range' => 'nullable|string|max:100',
            'product_type' => 'nullable|string|max:100',
            'utm_source' => 'nullable|string|max:100',
            'utm_medium' => 'nullable|string|max:100',
            'utm_campaign' => 'nullable|string|max:100',
            'utm_content' => 'nullable|string|max:100',
            'utm_term' => 'nullable|string|max:100',
            'landing_page' => 'nullable|string|max:255',
            'referrer' => 'nullable|string',
            'visitor_id' => 'nullable|string|max:100',
            'lead_source_position' => 'nullable|string|max:100',
            'vr_scene_id' => 'nullable|exists:project_vr_scenes,id',
            'vr_scene_title' => 'nullable|string|max:255',
            'vr_hotspot_id' => 'nullable|exists:project_vr_hotspots,id',
            'vr_hotspot_title' => 'nullable|string|max:255',
        ], [
            'name.required' => 'Vui lòng nhập Họ và tên.',
            'phone.required' => 'Vui lòng nhập Số điện thoại.',
            'email.email' => 'Địa chỉ email không chính xác.',
            'project_id.exists' => 'Dự án đã chọn không hợp lệ.',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => $validator->errors()->first(),
                'errors' => $validator->errors()
            ], 422);
        }

        $phone = $this->normalizePhone($request->phone);
        $projectId = $request->project_id;
        $visitorId = $request->visitor_id;

        // Wrap everything in a database transaction to prevent concurrency issues (Race Condition)
        $lead = DB::transaction(function () use ($request, $phone, $projectId, $visitorId) {
            // Check duplicate lead within 30 days
            $thirtyDaysAgo = Carbon::now()->subDays(30);
            $existingLead = Lead::where('phone', $phone)
                ->where('project_id', $projectId)
                ->where('created_at', '>=', $thirtyDaysAgo)
                ->first();

            $activityType = 'submit_price_form';
            $activityTitle = 'Gửi form tư vấn';
            if ($request->type === 'schedule_visit') {
                $activityType = 'submit_schedule_form';
                $activityTitle = 'Gửi form hẹn xem nhà';
            }

            if ($existingLead) {
                // Update fields with newest data
                $existingLead->update([
                    'name' => $request->name,
                    'email' => $request->email ?: $existingLead->email,
                    'message' => $request->message ?: $existingLead->message,
                    'demand_type' => $request->demand_type ?: $existingLead->demand_type,
                    'budget_range' => $request->budget_range ?: $existingLead->budget_range,
                    'product_type' => $request->product_type ?: $existingLead->product_type,
                    'lead_source_position' => $request->lead_source_position ?: $existingLead->lead_source_position,
                    'vr_scene_id' => $request->vr_scene_id ?: $existingLead->vr_scene_id,
                    'vr_scene_title' => $request->vr_scene_title ?: $existingLead->vr_scene_title,
                    'vr_hotspot_id' => $request->vr_hotspot_id ?: $existingLead->vr_hotspot_id,
                    'vr_hotspot_title' => $request->vr_hotspot_title ?: $existingLead->vr_hotspot_title,
                ]);

                if ($request->lead_source_position === 'vr360') {
                    LeadNote::create([
                        'lead_id' => $existingLead->id,
                        'user_id' => null,
                        'note' => 'Khách hàng gửi form từ vị trí VR 360. Cảnh: ' . ($request->vr_scene_title ?: 'N/A') . ' | Hotspot: ' . ($request->vr_hotspot_title ?: 'N/A'),
                    ]);
                }

                // Log activity
                LeadActivity::create([
                    'lead_id' => $existingLead->id,
                    'visitor_id' => $visitorId,
                    'type' => $activityType,
                    'title' => $activityTitle,
                    'description' => "Khách hàng đăng ký lại qua form: {$request->type}",
                    'metadata' => [
                        'message' => $request->message,
                        'demand_type' => $request->demand_type,
                    ]
                ]);

                // Link old activities of visitor_id to this lead
                if ($visitorId) {
                    LeadActivity::where('visitor_id', $visitorId)
                        ->whereNull('lead_id')
                        ->update(['lead_id' => $existingLead->id]);
                }

                // If status was closed/lost/invalid, bring it back
                if (in_array($existingLead->status, ['lost', 'invalid'])) {
                    $existingLead->update(['status' => 'reactivated']);
                    
                    LeadNote::create([
                        'lead_id' => $existingLead->id,
                        'user_id' => null,
                        'note' => 'Khách hàng gửi lại form sau khi bị đóng. Lead tự động Tái Kích Hoạt.',
                    ]);
                }

                $this->updateLeadScoreAndTemperature($existingLead);
                return $existingLead;
            }

            // If not duplicate, create new lead
            $lead = Lead::create([
                'name' => $request->name,
                'phone' => $phone,
                'email' => $request->email,
                'type' => $request->get('type', 'contact'),
                'message' => $request->message,
                'project_id' => $projectId,
                'user_id' => $request->user_id,
                'utm_source' => $request->get('utm_source') ?: ($request->lead_source_position === 'vr360' ? 'vr360' : 'organic'),
                'utm_medium' => $request->utm_medium,
                'utm_campaign' => $request->utm_campaign,
                'utm_content' => $request->utm_content,
                'utm_term' => $request->utm_term,
                'landing_page' => $request->landing_page,
                'referrer' => $request->referrer,
                'visitor_id' => $visitorId,
                'demand_type' => $request->demand_type,
                'budget_range' => $request->budget_range,
                'product_type' => $request->product_type,
                'lead_source_position' => $request->lead_source_position,
                'vr_scene_id' => $request->vr_scene_id,
                'vr_scene_title' => $request->vr_scene_title,
                'vr_hotspot_id' => $request->vr_hotspot_id,
                'vr_hotspot_title' => $request->vr_hotspot_title,
                'status' => 'new',
            ]);

            if ($request->lead_source_position === 'vr360') {
                LeadNote::create([
                    'lead_id' => $lead->id,
                    'user_id' => null,
                    'note' => 'Khách hàng gửi form từ vị trí VR 360. Cảnh: ' . ($request->vr_scene_title ?: 'N/A') . ' | Hotspot: ' . ($request->vr_hotspot_title ?: 'N/A'),
                ]);
            }

            // Log activity
            LeadActivity::create([
                'lead_id' => $lead->id,
                'visitor_id' => $visitorId,
                'type' => $activityType,
                'title' => $activityTitle,
                'description' => "Đăng ký thành công qua form: {$request->type}",
                'metadata' => [
                    'ip' => $request->ip(),
                ]
            ]);

            // Link old activities of visitor_id to this lead
            if ($visitorId) {
                LeadActivity::where('visitor_id', $visitorId)
                    ->whereNull('lead_id')
                    ->update(['lead_id' => $lead->id]);
            }

            // Update score first to determine temperature before sale assignment
            $this->updateLeadScoreAndTemperature($lead);

            // Round-Robin Automatic Sale Assignment
            $sales = User::role('sale')
                ->where('status', 'active')
                // Add more custom filters if needed (like not paused)
                ->get();

            if ($sales->count() > 0) {
                // Find agent with lowest count of currently active leads assigned
                $selectedAgent = null;
                $minActiveLeadsCount = 999999;

                foreach ($sales as $sale) {
                    $activeLeadsCount = Lead::where('assigned_to', $sale->id)
                        ->whereNotIn('status', ['lost', 'invalid', 'contract_signed'])
                        ->count();

                    if ($activeLeadsCount < $minActiveLeadsCount) {
                        $minActiveLeadsCount = $activeLeadsCount;
                        $selectedAgent = $sale;
                    }
                }

                if ($selectedAgent) {
                    $lead->update([
                        'assigned_to' => $selectedAgent->id,
                        'status' => 'assigned'
                    ]);

                    // Create Assignment log
                    LeadAssignment::create([
                        'lead_id' => $lead->id,
                        'sale_id' => $selectedAgent->id,
                        'assigned_by' => null,
                        'assigned_at' => Carbon::now(),
                        'status' => 'active'
                    ]);

                    // Log activity
                    LeadActivity::create([
                        'lead_id' => $lead->id,
                        'visitor_id' => $visitorId,
                        'type' => 'assigned_sale',
                        'title' => 'Đã phân công Sale',
                        'description' => "Lead được phân công tự động cho Sale: {$selectedAgent->name} (Round-Robin)",
                    ]);
                }
            }

            return $lead;
        });

        // Send email notification to Admin
        try {
            if (\App\Models\Setting::configureMail()) {
                $receiveEmail = \App\Models\Setting::get('mail_receive_address');
                if (!$receiveEmail) {
                    $receiveEmail = \App\Models\Setting::get('email', 'sales@masterisehomes.com');
                }

                if ($receiveEmail) {
                    \Illuminate\Support\Facades\Mail::to($receiveEmail)
                        ->send(new \App\Mail\LeadNotification($lead->load('project')));
                }
            }
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('SMTP Mail error on lead submit: ' . $e->getMessage());
        }

        return response()->json([
            'success' => true,
            'message' => 'Đã gửi thông tin thành công!',
            'data' => $lead
        ], 201);
    }

    /**
     * Public Event Tracking API.
     */
    public function trackEvent(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'visitor_id' => 'required|string|max:100',
            'event_name' => 'required|string|max:100',
            'project_id' => 'nullable|exists:projects,id',
            'metadata' => 'nullable|array',
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        $friendlyTitles = [
            'view_project' => 'Xem thông tin dự án',
            'view_pricing' => 'Xem bảng giá',
            'view_floorplan' => 'Xem mặt bằng',
            'view_legal' => 'Xem pháp lý',
            'click_hotline' => 'Bấm gọi Hotline',
            'click_zalo' => 'Bấm chat Zalo',
            'download_brochure' => 'Tải Brochure tài liệu',
            'open_finance_calculator' => 'Mở bảng tính tài chính',
            'complete_finance_calculator' => 'Hoàn tất tính tài chính',
            'return_visit' => 'Quay lại trang web',
            'open_vr360' => 'Khách hàng mở VR 360',
            'view_vr_scene' => 'Khách hàng xem cảnh VR',
            'view_vr_scene_over_30s' => 'Xem cảnh VR trên 30 giây',
            'click_vr_hotspot' => 'Bấm điểm tương tác VR',
            'click_vr_cta' => 'Bấm nút liên hệ trong VR',
            'enter_vr_fullscreen' => 'Mở VR toàn màn hình',
            'exit_vr_fullscreen' => 'Thoát VR toàn màn hình',
            'click_price_form_from_vr' => 'Bấm nhận bảng giá từ VR',
            'click_schedule_visit_from_vr' => 'Bấm đặt lịch xem từ VR',
        ];

        $title = $friendlyTitles[$request->event_name] ?? 'Hành động người dùng';
        
        // Find if there is an active lead with this visitor_id
        $lead = Lead::where('visitor_id', $request->visitor_id)
            ->orderBy('created_at', 'desc')
            ->first();

        $activity = LeadActivity::create([
            'lead_id' => $lead ? $lead->id : null,
            'visitor_id' => $request->visitor_id,
            'type' => $request->event_name,
            'title' => $title,
            'description' => "Khách hàng thực hiện hành động: {$title}",
            'metadata' => $request->metadata,
        ]);

        if ($lead) {
            $this->updateLeadScoreAndTemperature($lead);
        }

        return response()->json([
            'success' => true,
            'message' => 'Event tracked successfully',
            'data' => $activity
        ], 201);
    }

    /**
     * List leads (Admin/Agent CRM).
     */
    public function index(Request $request)
    {
        $user = $request->user();
        $query = Lead::with(['project', 'agent']);

        // CRM Role Filtering
        // Sale only sees their assigned leads
        if ($user->hasRole('sale') && !$user->hasRole(['admin', 'super_admin', 'sale_manager'])) {
            $query->where('assigned_to', $user->id);
        }

        // Lọc theo khoảng ngày tạo
        if ($request->has('start_date') && !empty($request->start_date)) {
            $query->whereDate('created_at', '>=', $request->start_date);
        }
        if ($request->has('end_date') && !empty($request->end_date)) {
            $query->whereDate('created_at', '<=', $request->end_date);
        }

        // Lọc nguồn, trạng thái, chiến dịch, độ nóng
        if ($request->has('status') && !empty($request->status)) {
            $query->where('status', $request->status);
        }
        if ($request->has('utm_source') && !empty($request->utm_source)) {
            $query->where('utm_source', $request->utm_source);
        }
        if ($request->has('utm_campaign') && !empty($request->utm_campaign)) {
            $query->where('utm_campaign', $request->utm_campaign);
        }
        if ($request->has('temperature') && !empty($request->temperature)) {
            $query->where('temperature', $request->temperature);
        }
        if ($request->has('demand_type') && !empty($request->demand_type)) {
            $query->where('demand_type', $request->demand_type);
        }
        if ($request->has('budget_range') && !empty($request->budget_range)) {
            $query->where('budget_range', $request->budget_range);
        }

        // Lọc theo sale gán
        if ($request->has('agent_id') && !empty($request->agent_id) && $user->hasRole(['admin', 'super_admin', 'sale_manager'])) {
            $query->where('assigned_to', $request->agent_id);
        }

        // Tìm kiếm tên, số điện thoại
        if ($request->has('q') && !empty($request->q)) {
            $search = $request->q;
            $query->where(function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('phone', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            });
        }

        $perPage = $request->get('per_page', 15);
        $leads = $query->orderBy('created_at', 'desc')->paginate($perPage);

        // Fetch custom recent note for each lead to show in the list
        $items = collect($leads->items())->map(function($lead) {
            $lastNote = $lead->notes()->first();
            $lead->last_note = $lastNote ? $lastNote->note : null;
            return $lead;
        });

        return response()->json([
            'success' => true,
            'data' => $items,
            'meta' => [
                'current_page' => $leads->currentPage(),
                'last_page' => $leads->lastPage(),
                'per_page' => $leads->perPage(),
                'total' => $leads->total(),
            ]
        ], 200);
    }

    /**
     * Show Lead detail.
     */
    public function show(Request $request, $id)
    {
        $user = $request->user();
        $lead = Lead::with(['project', 'agent', 'notes.user', 'activities.creator', 'assignments.sale'])->find($id);

        if (!$lead) {
            return response()->json(['success' => false, 'message' => 'Không tìm thấy Lead'], 404);
        }

        // Sale agent authorization guard
        if ($user->hasRole('sale') && !$user->hasRole(['admin', 'super_admin', 'sale_manager']) && $lead->assigned_to !== $user->id) {
            return response()->json(['success' => false, 'message' => 'Không có quyền truy cập Lead này'], 403);
        }

        return response()->json([
            'success' => true,
            'data' => $lead
        ], 200);
    }

    /**
     * Update lead fields/status/notes.
     */
    public function updateStatus(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'status' => 'required|string|in:new,assigned,called_first_time,no_answer,connected,qualified,sent_document,scheduled_visit,visited_project,negotiating,booking,deposit,contract_signed,lost,invalid,reactivated',
            'next_follow_up_at' => 'nullable|date',
            'last_contacted_at' => 'nullable|date',
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        $user = $request->user();
        $lead = Lead::find($id);

        if (!$lead) {
            return response()->json(['success' => false, 'message' => 'Không tìm thấy Lead'], 404);
        }

        // Sale agent authorization guard
        if ($user->hasRole('sale') && !$user->hasRole(['admin', 'super_admin', 'sale_manager']) && $lead->assigned_to !== $user->id) {
            return response()->json(['success' => false, 'message' => 'Không có quyền sửa Lead này'], 403);
        }

        $oldStatus = $lead->status;
        $updates = ['status' => $request->status];

        if ($request->has('next_follow_up_at')) {
            $updates['next_follow_up_at'] = $request->next_follow_up_at;
        }
        if ($request->has('last_contacted_at')) {
            $updates['last_contacted_at'] = $request->last_contacted_at;
        } else {
            // Auto update last_contacted_at when changing status to called...
            if (in_array($request->status, ['called_first_time', 'no_answer', 'connected', 'qualified'])) {
                $updates['last_contacted_at'] = Carbon::now();
            }
        }

        $lead->update($updates);

        // Add auto activity log
        LeadActivity::create([
            'lead_id' => $lead->id,
            'type' => 'status_changed',
            'title' => 'Thay đổi trạng thái',
            'description' => "Trạng thái chuyển từ '" . $this->getStatusLabel($oldStatus) . "' sang '" . $this->getStatusLabel($request->status) . "'",
            'created_by' => $user->id
        ]);

        // Add auto note
        LeadNote::create([
            'lead_id' => $lead->id,
            'user_id' => $user->id,
            'note' => "Cập nhật trạng thái chăm sóc: " . $this->getStatusLabel($request->status),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Cập nhật trạng thái thành công!',
            'data' => $lead->load(['notes.user', 'activities'])
        ], 200);
    }

    /**
     * Helper status translation.
     */
    private function getStatusLabel($status)
    {
        $labels = [
            'new' => 'Lead mới',
            'assigned' => 'Đã phân sale',
            'called_first_time' => 'Đã gọi lần 1',
            'no_answer' => 'Không nghe máy',
            'connected' => 'Đã kết nối',
            'qualified' => 'Có nhu cầu',
            'sent_document' => 'Đã gửi tài liệu',
            'scheduled_visit' => 'Đã hẹn xem dự án',
            'visited_project' => 'Đã đi xem',
            'negotiating' => 'Đang đàm phán',
            'booking' => 'Booking',
            'deposit' => 'Đặt cọc',
            'contract_signed' => 'Ký hợp đồng',
            'lost' => 'Mất lead',
            'invalid' => 'Không hợp lệ',
            'reactivated' => 'Tái kích hoạt',
        ];
        return $labels[$status] ?? $status;
    }

    /**
     * Add note.
     */
    public function addNote(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'note' => 'required|string|min:2',
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        $user = $request->user();
        $lead = Lead::find($id);

        if (!$lead) {
            return response()->json(['success' => false, 'message' => 'Không tìm thấy Lead'], 404);
        }

        if ($user->hasRole('sale') && !$user->hasRole(['admin', 'super_admin', 'sale_manager']) && $lead->assigned_to !== $user->id) {
            return response()->json(['success' => false, 'message' => 'Không có quyền viết note cho Lead này'], 403);
        }

        $note = LeadNote::create([
            'lead_id' => $lead->id,
            'user_id' => $user->id,
            'note' => $request->note
        ]);

        // Ghi nhận hoạt động timeline
        LeadActivity::create([
            'lead_id' => $lead->id,
            'type' => 'sale_note',
            'title' => 'Sale thêm ghi chú',
            'description' => "Sale {$user->name} đã thêm ghi chú chăm sóc.",
            'created_by' => $user->id
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Đã thêm ghi chú thành công!',
            'data' => $note->load('user')
        ], 201);
    }

    /**
     * Assign sale agent manually.
     */
    public function assign(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'agent_id' => 'required|exists:users,id',
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        $user = $request->user();
        $lead = Lead::find($id);

        if (!$lead) {
            return response()->json(['success' => false, 'message' => 'Không tìm thấy Lead'], 404);
        }

        $agent = User::find($request->agent_id);
        if (!$agent->hasRole('sale')) {
            return response()->json(['success' => false, 'message' => 'Nhân viên được chọn không có vai trò Sale'], 400);
        }

        DB::transaction(function () use ($lead, $agent, $user) {
            // Set old assignments to inactive
            LeadAssignment::where('lead_id', $lead->id)
                ->where('status', 'active')
                ->update(['status' => 'inactive']);

            // Update lead
            $lead->update([
                'assigned_to' => $agent->id,
                'status' => 'assigned'
            ]);

            // Create assignment
            LeadAssignment::create([
                'lead_id' => $lead->id,
                'sale_id' => $agent->id,
                'assigned_by' => $user->id,
                'assigned_at' => Carbon::now(),
                'status' => 'active'
            ]);

            // Ghi nhận hoạt động timeline
            LeadActivity::create([
                'lead_id' => $lead->id,
                'type' => 'assigned_sale',
                'title' => 'Đã đổi phân công Sale',
                'description' => "Lead được phân công lại cho Sale: {$agent->name} bởi {$user->name}",
                'created_by' => $user->id
            ]);

            // Add auto note
            LeadNote::create([
                'lead_id' => $lead->id,
                'user_id' => $user->id,
                'note' => "Chuyển giao phân công Sale cho nhân sự: {$agent->name}",
            ]);
        });

        return response()->json([
            'success' => true,
            'message' => 'Phân công Sale thành công!',
            'data' => $lead->load('agent')
        ], 200);
    }

    /**
     * Export Leads to CSV (Excel readable).
     */
    public function export(Request $request)
    {
        $user = $request->user();

        // Security check: Only Admin, Super Admin or Manager can export
        if (!$user->hasRole(['admin', 'super_admin', 'sale_manager'])) {
            return response()->json(['success' => false, 'message' => 'Không có quyền xuất dữ liệu'], 403);
        }

        $query = Lead::with(['project', 'agent']);

        // Apply same filters as index
        if ($request->has('start_date') && !empty($request->start_date)) {
            $query->whereDate('created_at', '>=', $request->start_date);
        }
        if ($request->has('end_date') && !empty($request->end_date)) {
            $query->whereDate('created_at', '<=', $request->end_date);
        }
        if ($request->has('status') && !empty($request->status)) {
            $query->where('status', $request->status);
        }
        if ($request->has('utm_source') && !empty($request->utm_source)) {
            $query->where('utm_source', $request->utm_source);
        }
        if ($request->has('utm_campaign') && !empty($request->utm_campaign)) {
            $query->where('utm_campaign', $request->utm_campaign);
        }
        if ($request->has('temperature') && !empty($request->temperature)) {
            $query->where('temperature', $request->temperature);
        }
        if ($request->has('demand_type') && !empty($request->demand_type)) {
            $query->where('demand_type', $request->demand_type);
        }
        if ($request->has('budget_range') && !empty($request->budget_range)) {
            $query->where('budget_range', $request->budget_range);
        }
        if ($request->has('q') && !empty($request->q)) {
            $search = $request->q;
            $query->where(function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('phone', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            });
        }

        $leads = $query->orderBy('created_at', 'desc')->get();

        $headers = [
            'Content-Type' => 'text/csv; charset=utf-8',
            'Content-Disposition' => 'attachment; filename="leads_export_' . date('Ymd_His') . '.csv"',
        ];

        $callback = function() use ($leads) {
            $file = fopen('php://output', 'w');
            
            // Output UTF-8 BOM so Excel opens it with Vietnamese fonts correctly
            fputs($file, "\xEF\xBB\xBF");
            
            // Header columns
            fputcsv($file, [
                'Họ tên', 'Số điện thoại', 'Email', 'Nguồn (Source)', 'Chiến dịch (Campaign)', 
                'Nhu cầu', 'Ngân sách dự kiến', 'Sản phẩm quan tâm', 'Trạng thái', 
                'Sale phụ trách', 'Điểm lead', 'Độ nóng', 'Ngày tạo', 'Ghi chú gần nhất'
            ]);

            foreach ($leads as $lead) {
                $lastNote = $lead->notes()->first();
                fputcsv($file, [
                    $lead->name,
                    $lead->phone,
                    $lead->email ?: '',
                    $lead->utm_source ?: 'organic',
                    $lead->utm_campaign ?: '',
                    $lead->demand_type ?: '',
                    $lead->budget_range ?: '',
                    $lead->product_type ?: '',
                    $this->getStatusLabel($lead->status),
                    $lead->agent ? $lead->agent->name : 'Chưa phân công',
                    $lead->score,
                    strtoupper($lead->temperature),
                    $lead->created_at->format('Y-m-d H:i:s'),
                    $lastNote ? $lastNote->note : ''
                ]);
            }
            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }

    /**
     * Stats Dashboard API.
     */
    public function dashboard(Request $request)
    {
        $user = $request->user();

        // 1. KPI Cards
        $totalLeads = Lead::count();
        $leadsToday = Lead::whereDate('created_at', Carbon::today())->count();
        $leadsThisWeek = Lead::where('created_at', '>=', Carbon::now()->startOfWeek())->count();
        
        $hotLeads = Lead::whereIn('temperature', ['hot', 'very_hot'])->count();
        $scheduledVisits = Lead::where('status', 'scheduled_visit')->count();
        $unassignedLeads = Lead::whereNull('assigned_to')->count();
        
        // Overdue follow-ups
        $overdueFollowUps = Lead::where('next_follow_up_at', '<', Carbon::now())
            ->whereNotIn('status', ['lost', 'invalid', 'contract_signed'])
            ->count();

        // Conversion Rate
        $closedCount = Lead::where('status', 'contract_signed')->count();
        $conversionRate = $totalLeads > 0 ? round(($closedCount / $totalLeads) * 100, 2) : 0;

        // 2. SLA Alerts
        // SLA 1: New leads uncalled after 5 minutes
        $slaUncalledLeads = Lead::where('status', 'new')
            ->where('created_at', '<', Carbon::now()->subMinutes(5))
            ->whereNull('last_contacted_at')
            ->with(['project', 'agent'])
            ->get();

        // SLA 2: Hot/Very Hot leads unassigned
        $slaUnassignedHot = Lead::whereIn('temperature', ['hot', 'very_hot'])
            ->whereNull('assigned_to')
            ->with(['project'])
            ->get();

        // SLA 3: Callback due today
        $slaCallbacksToday = Lead::whereDate('next_follow_up_at', Carbon::today())
            ->whereNotIn('status', ['lost', 'invalid', 'contract_signed'])
            ->with(['project', 'agent'])
            ->get();

        // SLA 4: Stale leads (> 3 days without update)
        $slaStaleLeads = Lead::where('updated_at', '<', Carbon::now()->subDays(3))
            ->whereNotIn('status', ['lost', 'invalid', 'contract_signed'])
            ->with(['project', 'agent'])
            ->get();

        // SLA 5: Duplicate phones
        $duplicatePhones = Lead::select('phone', DB::raw('count(id) as count'))
            ->groupBy('phone')
            ->having('count', '>', 1)
            ->get();

        // 3. Chart Data
        // Leads by source
        $leadsBySource = Lead::select('utm_source', DB::raw('count(id) as total'))
            ->groupBy('utm_source')
            ->orderBy('total', 'desc')
            ->get();

        // Leads by status
        $leadsByStatus = Lead::select('status', DB::raw('count(id) as total'))
            ->groupBy('status')
            ->get()
            ->map(function($item) {
                $item->label = $this->getStatusLabel($item->status);
                return $item;
            });

        // Leads last 7 days
        $leadsLast7Days = [];
        for ($i = 6; $i >= 0; $i--) {
            $date = Carbon::today()->subDays($i);
            $count = Lead::whereDate('created_at', $date)->count();
            $leadsLast7Days[] = [
                'date' => $date->format('d/m'),
                'count' => $count
            ];
        }

        // Sale Performance leaderboard
        $salesList = User::role('sale')->get();
        $saleLeaderboard = [];
        foreach ($salesList as $sale) {
            $assigned = Lead::where('assigned_to', $sale->id)->count();
            $closed = Lead::where('assigned_to', $sale->id)->where('status', 'contract_signed')->count();
            $active = Lead::where('assigned_to', $sale->id)->whereNotIn('status', ['lost', 'invalid', 'contract_signed'])->count();
            
            $saleLeaderboard[] = [
                'id' => $sale->id,
                'name' => $sale->name,
                'assigned' => $assigned,
                'closed' => $closed,
                'active' => $active,
                'conv_rate' => $assigned > 0 ? round(($closed / $assigned) * 100, 1) : 0
            ];
        }

        usort($saleLeaderboard, function($a, $b) {
            return $b['conv_rate'] <=> $a['conv_rate'];
        });

        return response()->json([
            'success' => true,
            'data' => [
                'kpis' => [
                    'total_leads' => $totalLeads,
                    'leads_today' => $leadsToday,
                    'leads_this_week' => $leadsThisWeek,
                    'hot_leads' => $hotLeads,
                    'scheduled_visits' => $scheduledVisits,
                    'unassigned_leads' => $unassignedLeads,
                    'overdue_follow_ups' => $overdueFollowUps,
                    'conversion_rate' => $conversionRate,
                ],
                'sla_alerts' => [
                    'uncalled_after_5m' => $slaUncalledLeads,
                    'unassigned_hot' => $slaUnassignedHot,
                    'callbacks_today' => $slaCallbacksToday,
                    'stale_leads' => $slaStaleLeads,
                    'duplicate_phones' => $duplicatePhones
                ],
                'charts' => [
                    'leads_by_source' => $leadsBySource,
                    'leads_by_status' => $leadsByStatus,
                    'leads_history' => $leadsLast7Days,
                    'sale_performance' => array_slice($saleLeaderboard, 0, 5)
                ]
            ]
        ], 200);
    }
}
