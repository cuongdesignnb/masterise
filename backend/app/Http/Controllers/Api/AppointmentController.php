<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Appointment;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class AppointmentController extends Controller
{
    /**
     * Book a new visit appointment (Customer only).
     */
    public function book(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'project_id' => 'required|exists:projects,id',
            'appointment_date' => 'required|date|after_or_equal:today',
            'appointment_time' => 'required|date_format:H:i',
            'notes' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        $user = $request->user();

        // Check if there is already an appointment for the same date/time
        $exists = Appointment::where('user_id', $user->id)
            ->where('project_id', $request->project_id)
            ->where('appointment_date', $request->appointment_date)
            ->where('status', '!=', 'cancelled')
            ->exists();

        if ($exists) {
            return response()->json([
                'success' => false,
                'message' => 'You already have an appointment booked for this project on this date.'
            ], 400);
        }

        // Auto assign to a sale agent
        $agent = User::role('sale')->inRandomOrder()->first();

        $appointment = Appointment::create([
            'user_id' => $user->id,
            'project_id' => $request->project_id,
            'appointment_date' => $request->appointment_date,
            'appointment_time' => $request->appointment_time,
            'notes' => $request->notes,
            'status' => 'pending',
            'assigned_to' => $agent ? $agent->id : null,
        ]);

        // Send email notification to Admin
        try {
            if (\App\Models\Setting::configureMail()) {
                $receiveEmail = \App\Models\Setting::get('mail_receive_address');
                if (!$receiveEmail) {
                    $receiveEmail = \App\Models\Setting::get('email', 'sales@masterisehomes.com');
                }

                if ($receiveEmail) {
                    \Illuminate\Support\Facades\Mail::to($receiveEmail)
                        ->send(new \App\Mail\AppointmentNotification($appointment->load(['project', 'user', 'agent'])));
                }
            }
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('SMTP Mail error on appointment booking: ' . $e->getMessage());
        }

        return response()->json([
            'success' => true,
            'message' => 'Appointment booked successfully',
            'data' => $appointment->load(['project', 'agent'])
        ], 201);
    }

    /**
     * Get appointments list (For admin, sale agents, or logged in customer).
     */
    public function index(Request $request)
    {
        $user = $request->user();
        $query = Appointment::with(['project', 'user', 'agent']);

        if ($user->hasRole('customer')) {
            // Customers can only see their own appointments
            $query->where('user_id', $user->id);
        } elseif ($user->hasRole('sale') && !$user->hasRole(['admin', 'super_admin', 'sale_manager'])) {
            // Sale agents can only see appointments assigned to them
            $query->where('assigned_to', $user->id);
        }

        // Filter by status
        if ($request->has('status') && !empty($request->status)) {
            $query->where('status', $request->status);
        }

        // Filter by date
        if ($request->has('date') && !empty($request->date)) {
            $query->where('appointment_date', $request->date);
        }

        $perPage = $request->get('per_page', 15);
        $appointments = $query->orderBy('appointment_date', 'asc')
            ->orderBy('appointment_time', 'asc')
            ->paginate($perPage);

        return response()->json([
            'success' => true,
            'data' => $appointments->items(),
            'meta' => [
                'current_page' => $appointments->currentPage(),
                'last_page' => $appointments->lastPage(),
                'per_page' => $appointments->perPage(),
                'total' => $appointments->total(),
            ]
        ], 200);
    }

    /**
     * Update appointment status (Admin/Agent only).
     */
    public function updateStatus(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'status' => 'required|string|in:pending,confirmed,completed,cancelled',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        $user = $request->user();
        $appointment = Appointment::find($id);

        if (!$appointment) {
            return response()->json([
                'success' => false,
                'message' => 'Appointment not found'
            ], 404);
        }

        // Authorization check
        if ($user->hasRole('customer')) {
            if ($appointment->user_id !== $user->id) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized operation'
                ], 403);
            }
            
            // Customer can only cancel their own appointment
            if ($request->status === 'cancelled') {
                $appointment->update(['status' => 'cancelled']);
                return response()->json([
                    'success' => true,
                    'message' => 'Appointment cancelled successfully',
                    'data' => $appointment
                ], 200);
            }
            
            return response()->json([
                'success' => false,
                'message' => 'Customers can only cancel their own appointments'
            ], 403);
        }

        // Agents can only manage their own assigned appointments
        if ($user->hasRole('sale') && !$user->hasRole(['admin', 'super_admin', 'sale_manager']) && $appointment->assigned_to !== $user->id) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized access'
            ], 403);
        }

        $appointment->update(['status' => $request->status]);

        return response()->json([
            'success' => true,
            'message' => 'Appointment status updated successfully',
            'data' => $appointment
        ], 200);
    }
}
