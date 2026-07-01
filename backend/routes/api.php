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
use App\Http\Controllers\Api\HeroBannerController;
use App\Http\Controllers\Api\FaqController;
use App\Http\Controllers\Api\TestimonialController;
use App\Http\Controllers\Api\PartnerController;
use App\Http\Controllers\Api\Admin\AiSettingsController;
use App\Http\Controllers\Api\Admin\AiContentController;
use App\Http\Controllers\Api\Admin\AiBatchController;
use App\Http\Controllers\Api\PageController;
use Illuminate\Support\Facades\Route;

Route::group(['prefix' => 'v1'], function() {
    
    // 1. Auth routes (public / guest)
    Route::post('/auth/register', [AuthController::class, 'register']);
    Route::post('/auth/login', [AuthController::class, 'login']);
    Route::get('/login', function() {
        return response()->json(['message' => 'Unauthenticated.'], 401);
    })->name('login');

    // 2. Public / Guest routes (no auth needed)
    // Projects
    Route::get('/projects', [ProjectController::class, 'index']);
    Route::get('/projects/featured', [ProjectController::class, 'featured']);
    Route::get('/projects/{slug}', [ProjectController::class, 'show']);
    Route::get('/project-categories', [ProjectController::class, 'categories']);

    // Posts
    Route::get('/posts', [PostController::class, 'index']);
    Route::get('/posts/featured', [PostController::class, 'featured']);
    Route::get('/posts/{slug}', [PostController::class, 'show']);
    Route::get('/post-categories', [PostController::class, 'categories']);

    // Static Pages Public Route
    Route::get('/pages', [PageController::class, 'index']);
    Route::get('/pages/{slug}', [PageController::class, 'show']);

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

    // Homepage content
    Route::get('/hero-banners', [HeroBannerController::class, 'index']);
    Route::get('/faqs', [FaqController::class, 'index']);
    Route::get('/testimonials', [TestimonialController::class, 'index']);
    Route::get('/partners', [PartnerController::class, 'index']);
    
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
            Route::get('/admin/projects', [ProjectController::class, 'adminIndex']);
            Route::get('/admin/projects/{id}', [ProjectController::class, 'adminShow']);
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

            // Static Pages Admin CRUD
            Route::get('/pages', [PageController::class, 'index']);
            Route::post('/pages', [PageController::class, 'store']);
            Route::put('/pages/{id}', [PageController::class, 'update']);
            Route::delete('/pages/{id}', [PageController::class, 'destroy']);

            Route::post('/post-categories', [PostController::class, 'storeCategory']);
            Route::put('/post-categories/{id}', [PostController::class, 'updateCategory']);
            Route::delete('/post-categories/{id}', [PostController::class, 'destroyCategory']);

            // Media
            Route::get('/media', [MediaController::class, 'index']);
            Route::post('/media/upload', [MediaController::class, 'upload']);
            Route::delete('/media/{id}', [MediaController::class, 'destroy']);

            // SEO Meta updates
            Route::post('/seo', [SeoController::class, 'update']);

            // Homepage content CRUD
            Route::post('/hero-banners', [HeroBannerController::class, 'store']);
            Route::put('/hero-banners/{id}', [HeroBannerController::class, 'update']);
            Route::delete('/hero-banners/{id}', [HeroBannerController::class, 'destroy']);

            Route::post('/faqs', [FaqController::class, 'store']);
            Route::put('/faqs/{id}', [FaqController::class, 'update']);
            Route::delete('/faqs/{id}', [FaqController::class, 'destroy']);

            Route::post('/testimonials', [TestimonialController::class, 'store']);
            Route::put('/testimonials/{id}', [TestimonialController::class, 'update']);
            Route::delete('/testimonials/{id}', [TestimonialController::class, 'destroy']);

            Route::post('/partners', [PartnerController::class, 'store']);
            Route::put('/partners/{id}', [PartnerController::class, 'update']);
            Route::delete('/partners/{id}', [PartnerController::class, 'destroy']);
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
            Route::post('/settings/test-email', [SettingController::class, 'testEmail']);

            // User management
            Route::apiResource('/users', UserController::class);
        });

        // AI Content Automation API Routes
        Route::prefix('admin/ai-content')
            ->group(function () {
                Route::get('/settings', [AiSettingsController::class, 'index'])
                    ->middleware('permission:ai.settings.view');

                Route::post('/settings', [AiSettingsController::class, 'update'])
                    ->middleware('permission:ai.settings.update');

                Route::post('/settings/test-connection', [AiSettingsController::class, 'testConnection'])
                    ->middleware('permission:ai.settings.update');

                Route::post('/generate-article', [AiContentController::class, 'generateArticle'])
                    ->middleware('permission:ai.article.generate');

                Route::post('/generate-article-with-image', [AiContentController::class, 'generateArticle'])
                    ->middleware('permission:ai.article.generate');

                Route::post('/posts/{post}/regenerate-image', [AiContentController::class, 'regenerateImage'])
                    ->middleware('permission:ai.image.generate');

                Route::get('/drafts', [AiContentController::class, 'drafts'])
                    ->middleware('permission:posts.view');

                Route::patch('/posts/{post}/schedule', [AiContentController::class, 'schedulePost'])
                    ->middleware('permission:ai.schedule.manage');

                Route::post('/posts/{post}/publish-now', [AiContentController::class, 'publishNow'])
                    ->middleware('permission:posts.publish');

                Route::post('/posts/publish-due', [AiContentController::class, 'publishDue'])
                    ->middleware('permission:posts.publish');

                Route::post('/batches', [AiBatchController::class, 'store'])
                    ->middleware('permission:ai.bulk.generate');

                Route::get('/batches', [AiBatchController::class, 'index'])
                    ->middleware('permission:ai.jobs.view');

                Route::get('/batches/{batch}', [AiBatchController::class, 'show'])
                    ->middleware('permission:ai.jobs.view');

                Route::post('/batches/{batch}/schedule', [AiBatchController::class, 'schedule'])
                    ->middleware('permission:ai.schedule.manage');

                Route::post('/batches/{batch}/cancel', [AiBatchController::class, 'cancel'])
                    ->middleware('permission:ai.bulk.generate');

                Route::get('/jobs', [AiContentController::class, 'jobsHistory'])
                    ->middleware('permission:ai.jobs.view');
            });

    });
});
