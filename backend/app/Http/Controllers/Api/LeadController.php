<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Lead;
use App\Models\LeadNote;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class LeadController extends Controller
{
    /**
     * Submit a new lead (public form).
     */
    public function submit(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'phone' => 'required|string|max:20',
            'email' => 'nullable|email|max:255',
            'type' => 'nullable|string|in:contact,consultation,download_brochure,newsletter',
            'message' => 'nullable|string',
            'project_id' => 'nullable|exists:projects,id',
            'user_id' => 'nullable|exists:users,id',
            'utm_source' => 'nullable|string|max:100',
            'utm_medium' => 'nullable|string|max:100',
            'utm_campaign' => 'nullable|string|max:100',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        // Create lead
        $lead = Lead::create([
            'name' => $request->name,
            'phone' => $request->phone,
            'email' => $request->email,
            'type' => $request->get('type', 'contact'),
            'message' => $request->message,
            'project_id' => $request->project_id,
            'user_id' => $request->user_id,
            'utm_source' => $request->utm_source,
            'utm_medium' => $request->utm_medium,
            'utm_campaign' => $request->utm_campaign,
            'status' => 'new',
        ]);

        // Auto-assignment logic (simple round-robin or assign to a default agent)
        // Find a user with role 'sale' and assign them
        $agent = User::role('sale')->inRandomOrder()->first();
        if ($agent) {
            $lead->update(['assigned_to' => $agent->id]);
        }

        return response()->json([
            'success' => true,
            'message' => 'Lead submitted successfully',
            'data' => $lead
        ], 201);
    }

    /**
     * List leads (Admin/Agent CRM).
     */
    public function index(Request $request)
    {
        $user = $request->user();
        $query = Lead::with(['project', 'agent', 'notes.user']);

        // Agents can only see leads assigned to them
        if ($user->hasRole('sale') && !$user->hasRole(['admin', 'super_admin', 'sale_manager'])) {
            $query->where('assigned_to', $user->id);
        }

        // Filter by status
        if ($request->has('status') && !empty($request->status)) {
            $query->where('status', $request->status);
        }

        // Filter by type
        if ($request->has('type') && !empty($request->type)) {
            $query->where('type', $request->type);
        }

        // Filter by project
        if ($request->has('project_id') && !empty($request->project_id)) {
            $query->where('project_id', $request->project_id);
        }

        // Filter by agent (Admins only)
        if ($request->has('agent_id') && !empty($request->agent_id) && $user->hasRole(['admin', 'super_admin', 'sale_manager'])) {
            $query->where('assigned_to', $request->agent_id);
        }

        // Search name/phone
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

        return response()->json([
            'success' => true,
            'data' => $leads->items(),
            'meta' => [
                'current_page' => $leads->currentPage(),
                'last_page' => $leads->lastPage(),
                'per_page' => $leads->perPage(),
                'total' => $leads->total(),
            ]
        ], 200);
    }

    /**
     * Show lead details.
     */
    public function show(Request $request, $id)
    {
        $user = $request->user();
        $lead = Lead::with(['project', 'agent', 'notes.user'])->find($id);

        if (!$lead) {
            return response()->json([
                'success' => false,
                'message' => 'Lead not found'
            ], 404);
        }

        // Authorization check
        if ($user->hasRole('sale') && !$user->hasRole(['admin', 'super_admin', 'sale_manager']) && $lead->assigned_to !== $user->id) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized access'
            ], 403);
        }

        return response()->json([
            'success' => true,
            'data' => $lead
        ], 200);
    }

    /**
     * Update lead status.
     */
    public function updateStatus(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'status' => 'required|string|in:new,contacted,consulting,closed,cancelled',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        $user = $request->user();
        $lead = Lead::find($id);

        if (!$lead) {
            return response()->json([
                'success' => false,
                'message' => 'Lead not found'
            ], 404);
        }

        // Authorization check
        if ($user->hasRole('sale') && !$user->hasRole(['admin', 'super_admin', 'sale_manager']) && $lead->assigned_to !== $user->id) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized access'
            ], 403);
        }

        $oldStatus = $lead->status;
        $lead->update(['status' => $request->status]);

        // Add auto-note
        LeadNote::create([
            'lead_id' => $lead->id,
            'user_id' => $user->id,
            'note' => "Trạng thái chuyển từ '{$oldStatus}' sang '{$request->status}'",
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Lead status updated successfully',
            'data' => $lead->load('notes.user')
        ], 200);
    }

    /**
     * Assign lead to sale agent.
     */
    public function assign(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'agent_id' => 'required|exists:users,id',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        $lead = Lead::find($id);

        if (!$lead) {
            return response()->json([
                'success' => false,
                'message' => 'Lead not found'
            ], 404);
        }

        $agent = User::find($request->agent_id);
        if (!$agent->hasRole('sale')) {
            return response()->json([
                'success' => false,
                'message' => 'Selected user is not a sales agent'
            ], 400);
        }

        $lead->update(['assigned_to' => $agent->id]);

        // Add auto-note
        LeadNote::create([
            'lead_id' => $lead->id,
            'user_id' => $request->user()->id,
            'note' => "Lead được phân công cho nhân viên: {$agent->name}",
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Lead assigned successfully',
            'data' => $lead->load('agent')
        ], 200);
    }

    /**
     * Add manual note to lead.
     */
    public function addNote(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'note' => 'required|string|min:5',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        $user = $request->user();
        $lead = Lead::find($id);

        if (!$lead) {
            return response()->json([
                'success' => false,
                'message' => 'Lead not found'
            ], 404);
        }

        // Authorization check
        if ($user->hasRole('sale') && !$user->hasRole(['admin', 'super_admin', 'sale_manager']) && $lead->assigned_to !== $user->id) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized access'
            ], 403);
        }

        $note = LeadNote::create([
            'lead_id' => $lead->id,
            'user_id' => $user->id,
            'note' => $request->note,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Note added successfully',
            'data' => $note->load('user')
        ], 201);
    }
}
