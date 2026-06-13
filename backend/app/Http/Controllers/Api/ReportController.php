<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Project;
use App\Models\Post;
use App\Models\Lead;
use App\Models\Appointment;
use Illuminate\Http\Request;

class ReportController extends Controller
{
    /**
     * Get system statistics for the admin dashboard.
     */
    public function stats(Request $request)
    {
        $user = $request->user();

        // Admin, managers, and marketing can see global stats
        // Sales agents can only see counts of their assigned leads/appointments
        $isGlobalViewer = $user->hasRole(['super_admin', 'admin', 'marketing', 'sale_manager']);

        $projectsCount = Project::count();
        $postsCount = Post::count();

        if ($isGlobalViewer) {
            $leadsCount = Lead::count();
            $newLeadsCount = Lead::where('status', 'new')->count();
            $appointmentsCount = Appointment::count();
            $pendingAppointmentsCount = Appointment::where('status', 'pending')->count();
            
            $recentLeads = Lead::with('project')
                ->orderBy('created_at', 'desc')
                ->limit(5)
                ->get();
                
            $recentAppointments = Appointment::with(['project', 'user'])
                ->orderBy('created_at', 'desc')
                ->limit(5)
                ->get();
        } else {
            // Sales agent specific stats
            $leadsCount = Lead::where('assigned_to', $user->id)->count();
            $newLeadsCount = Lead::where('assigned_to', $user->id)->where('status', 'new')->count();
            $appointmentsCount = Appointment::where('assigned_to', $user->id)->count();
            $pendingAppointmentsCount = Appointment::where('assigned_to', $user->id)->where('status', 'pending')->count();
            
            $recentLeads = Lead::where('assigned_to', $user->id)
                ->with('project')
                ->orderBy('created_at', 'desc')
                ->limit(5)
                ->get();
                
            $recentAppointments = Appointment::where('assigned_to', $user->id)
                ->with(['project', 'user'])
                ->orderBy('created_at', 'desc')
                ->limit(5)
                ->get();
        }

        return response()->json([
            'success' => true,
            'data' => [
                'projects_count' => $projectsCount,
                'posts_count' => $postsCount,
                'leads_count' => $leadsCount,
                'new_leads_count' => $newLeadsCount,
                'appointments_count' => $appointmentsCount,
                'pending_appointments_count' => $pendingAppointmentsCount,
                'recent_leads' => $recentLeads,
                'recent_appointments' => $recentAppointments
            ]
        ], 200);
    }
}
