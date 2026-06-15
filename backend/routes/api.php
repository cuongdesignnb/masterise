<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\ProjectController;
use App\Http\Controllers\Api\PostController;
use App\Http\Controllers\Api\LeadController;
use App\Http\Controllers\Api\AppointmentController;
use App\Http\Controllers\Api\SettingController;
use App\Http\Controllers\Api\SeoController;
use App\Http\Controllers\Api\MediaController;
use App\Http\Controllers\Api\ReportController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\DeveloperController;
use App\Http\Controllers\Api\LocationController;
use Illuminate\Support\Facades\Route;

Route::group(['prefix' => 'v1'], function() {
    
    // 1. Auth routes (public / guest)
    Route::post('/auth/register', [AuthController::class, 'register']);
    Route::post('/auth/login', [AuthController::class, 'login']);

    // 2. Public / Guest routes (no auth needed)
    // Projects
    Route::get('/projects', [ProjectController::class, 'index']);
    Route::get('/projects/featured', [ProjectController::class, 'featured']);
    Route::get('/projects/{slug}', [ProjectController::class, 'show']);
    Route::get('/project-categories', [ProjectController::class, 'categories']);
    Route::get('/project-regions', [ProjectController::class, 'regions']);

    // Posts
    Route::get('/posts', [PostController::class, 'index']);
    Route::get('/posts/featured', [PostController::class, 'featured']);
    Route::get('/posts/{slug}', [PostController::class, 'show']);
    Route::get('/post-categories', [PostController::class, 'categories']);

    // Developers
    Route::get('/developers', [DeveloperController::class, 'index']);
    Route::get('/developers/{id}', [DeveloperController::class, 'show']);

    // Locations
    Route::get('/locations', [LocationController::class, 'index']);
    Route::get('/locations/{id}', [LocationController::class, 'show']);

    // Leads submit
    Route::post('/leads', [LeadController::class, 'submit']);
    Route::post('/leads/submit', [LeadController::class, 'submit']);
    Route::post('/leads/contact', [LeadController::class, 'submit']); // alias
    Route::post('/leads/project-consultation', [LeadController::class, 'submit']); // alias
    Route::post('/leads/download-brochure', [LeadController::class, 'submit']); // alias
    Route::post('/lead-events', [LeadController::class, 'trackEvent']);

    // System config & SEO
    Route::get('/settings/public', [SettingController::class, 'publicSettings']);
    Route::get('/seo/by-path', [SeoController::class, 'byPath']);
    
    // VR 360 Tour public route
    Route::get('/projects/{slug}/vr-tour', [App\Http\Controllers\Api\ProjectVrTourController::class, 'show']);

    // 3. Authenticated routes (auth:sanctum)
    Route::group(['middleware' => 'auth:sanctum'], function() {
        
        // Auth me & password
        Route::get('/auth/me', [AuthController::class, 'me']);
        Route::post('/auth/logout', [AuthController::class, 'logout']);
        Route::post('/auth/change-password', [AuthController::class, 'changePassword']);
        Route::put('/auth/profile', [AuthController::class, 'updateProfile']);
        Route::post('/projects/{id}/toggle-save', [ProjectController::class, 'toggleSave']);
        Route::get('/reports/stats', [ReportController::class, 'stats'])->middleware('permission:dashboard.view');
        Route::get('/users/sales', [AuthController::class, 'salesAgents']);

        // Appointments booking & list (accessible by customer to book/list, agent to view/confirm)
        Route::post('/appointments', [AppointmentController::class, 'book']);
        Route::get('/appointments', [AppointmentController::class, 'index']);
        Route::patch('/appointments/{id}/status', [AppointmentController::class, 'updateStatus']);

        // Leads CRM Dashboard and Export (placed before dynamic {id} routes)
        Route::get('/leads/export', [LeadController::class, 'export'])->middleware('role:super_admin|admin|sale_manager');
        Route::get('/lead-dashboard', [LeadController::class, 'dashboard'])->middleware('role:super_admin|admin|sale_manager');

        // Leads CRM notes & list (agent can view list of assigned, update status, add notes)
        Route::get('/leads', [LeadController::class, 'index'])->middleware('permission:leads.view');
        Route::get('/leads/{id}', [LeadController::class, 'show'])->middleware('permission:leads.view');
        Route::patch('/leads/{id}', [LeadController::class, 'updateStatus'])->middleware('permission:leads.view'); // alias
        Route::patch('/leads/{id}/status', [LeadController::class, 'updateStatus'])->middleware('permission:leads.view');
        Route::post('/leads/{id}/notes', [LeadController::class, 'addNote'])->middleware('permission:leads.view');

        // Admin/Super Admin/Marketing/Manager routes
        Route::group(['middleware' => ['role:super_admin|admin|marketing|sale_manager']], function() {
            // Developers CRUD
            Route::post('/developers', [DeveloperController::class, 'store']);
            Route::put('/developers/{id}', [DeveloperController::class, 'update']);
            Route::delete('/developers/{id}', [DeveloperController::class, 'destroy']);

            // Locations CRUD
            Route::post('/locations', [LocationController::class, 'store']);
            Route::put('/locations/{id}', [LocationController::class, 'update']);
            Route::delete('/locations/{id}', [LocationController::class, 'destroy']);

            // Projects CRUD
            Route::post('/projects', [ProjectController::class, 'store']);
            Route::put('/projects/{id}', [ProjectController::class, 'update']);
            Route::delete('/projects/{id}', [ProjectController::class, 'destroy']);

            Route::post('/project-categories', [ProjectController::class, 'storeCategory']);
            Route::put('/project-categories/{id}', [ProjectController::class, 'updateCategory']);
            Route::delete('/project-categories/{id}', [ProjectController::class, 'destroyCategory']);

            // Posts CRUD
            Route::post('/posts', [PostController::class, 'store']);
            Route::put('/posts/{id}', [PostController::class, 'update']);
            Route::delete('/posts/{id}', [PostController::class, 'destroy']);

            Route::post('/post-categories', [PostController::class, 'storeCategory']);
            Route::put('/post-categories/{id}', [PostController::class, 'updateCategory']);
            Route::delete('/post-categories/{id}', [PostController::class, 'destroyCategory']);

            // Media
            Route::get('/media', [MediaController::class, 'index']);
            Route::post('/media/upload', [MediaController::class, 'upload']);
            Route::delete('/media/{id}', [MediaController::class, 'destroy']);

            // SEO Meta updates
            Route::post('/seo', [SeoController::class, 'update']);
        });

        // Admin/Super Admin/Manager only
        Route::group(['middleware' => ['role:super_admin|admin|sale_manager']], function() {
            // Assign leads
            Route::post('/leads/{id}/assign', [LeadController::class, 'assign']);
            Route::patch('/leads/{id}/assign', [LeadController::class, 'assign']); // alias

            // VR 360 Admin routes
            Route::get('/admin/projects/{project_id}/vr-tour', [App\Http\Controllers\Api\Admin\ProjectVrTourAdminController::class, 'getTour']);
            Route::post('/admin/projects/{project_id}/vr-tour', [App\Http\Controllers\Api\Admin\ProjectVrTourAdminController::class, 'saveTour']);
            Route::post('/admin/vr-tours/{tour_id}/scenes', [App\Http\Controllers\Api\Admin\ProjectVrTourAdminController::class, 'addScene']);
            Route::patch('/admin/vr-scenes/{scene_id}', [App\Http\Controllers\Api\Admin\ProjectVrTourAdminController::class, 'updateScene']);
            Route::delete('/admin/vr-scenes/{scene_id}', [App\Http\Controllers\Api\Admin\ProjectVrTourAdminController::class, 'destroyScene']);
            Route::post('/admin/vr-scenes/{scene_id}/hotspots', [App\Http\Controllers\Api\Admin\ProjectVrTourAdminController::class, 'addHotspot']);
            Route::patch('/admin/vr-hotspots/{hotspot_id}', [App\Http\Controllers\Api\Admin\ProjectVrTourAdminController::class, 'updateHotspot']);
            Route::delete('/admin/vr-hotspots/{hotspot_id}', [App\Http\Controllers\Api\Admin\ProjectVrTourAdminController::class, 'destroyHotspot']);
        });

        // Admin/Super Admin only
        Route::group(['middleware' => ['role:super_admin|admin']], function() {
            // Bulk settings update
            Route::get('/settings', [SettingController::class, 'index']);
            Route::put('/settings', [SettingController::class, 'update']);

            // User management
            Route::apiResource('/users', UserController::class);
        });

    });
});
