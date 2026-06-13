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

    // Leads submit
    Route::post('/leads/submit', [LeadController::class, 'submit']);
    Route::post('/leads/contact', [LeadController::class, 'submit']); // alias
    Route::post('/leads/project-consultation', [LeadController::class, 'submit']); // alias
    Route::post('/leads/download-brochure', [LeadController::class, 'submit']); // alias

    // System config & SEO
    Route::get('/settings/public', [SettingController::class, 'publicSettings']);
    Route::get('/seo/by-path', [SeoController::class, 'byPath']);

    // 3. Authenticated routes (auth:sanctum)
    Route::group(['middleware' => 'auth:sanctum'], function() {
        
        // Auth me & password
        Route::get('/auth/me', [AuthController::class, 'me']);
        Route::post('/auth/logout', [AuthController::class, 'logout']);
        Route::post('/auth/change-password', [AuthController::class, 'changePassword']);
        Route::put('/auth/profile', [AuthController::class, 'updateProfile']);
        Route::post('/projects/{id}/toggle-save', [ProjectController::class, 'toggleSave']);
        Route::get('/reports/stats', [ReportController::class, 'stats']);
        Route::get('/users/sales', [AuthController::class, 'salesAgents']);

        // Appointments booking & list (accessible by customer to book/list, agent to view/confirm)
        Route::post('/appointments', [AppointmentController::class, 'book']);
        Route::get('/appointments', [AppointmentController::class, 'index']);
        Route::patch('/appointments/{id}/status', [AppointmentController::class, 'updateStatus']);

        // Leads CRM notes & list (agent can view list of assigned, update status, add notes)
        Route::get('/leads', [LeadController::class, 'index']);
        Route::get('/leads/{id}', [LeadController::class, 'show']);
        Route::patch('/leads/{id}/status', [LeadController::class, 'updateStatus']);
        Route::post('/leads/{id}/notes', [LeadController::class, 'addNote']);

        // Admin/Super Admin/Marketing only routes
        Route::group(['middleware' => ['role:super_admin|admin|marketing']], function() {
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

        // Admin/Super Admin only
        Route::group(['middleware' => ['role:super_admin|admin']], function() {
            // Assign leads
            Route::patch('/leads/{id}/assign', [LeadController::class, 'assign']);

            // Bulk settings update
            Route::get('/settings', [SettingController::class, 'index']);
            Route::put('/settings', [SettingController::class, 'update']);
        });

    });
});
