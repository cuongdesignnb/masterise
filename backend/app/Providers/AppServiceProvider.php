<?php

namespace App\Providers;

use App\Models\CareerJob;
use App\Models\Location;
use App\Models\Post;
use App\Models\PostCategory;
use App\Models\Project;
use App\Models\ProjectCategory;
use App\Models\ProjectStatusDefinition;
use App\Models\Region;
use App\Models\Setting;
use App\Models\Tag;
use App\Support\PublicContentCache;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        $this->invalidateOnChange(Project::class, [
            'projects.list', 'projects.featured', 'projects.options',
        ]);
        $this->invalidateOnChange(ProjectCategory::class, [
            'projects.list', 'projects.featured', 'projects.taxonomy',
        ]);
        $this->invalidateOnChange(ProjectStatusDefinition::class, [
            'projects.list', 'projects.featured', 'projects.taxonomy',
        ]);
        $this->invalidateOnChange(Location::class, [
            'projects.list', 'projects.featured', 'projects.taxonomy',
        ]);
        $this->invalidateOnChange(Region::class, [
            'projects.list', 'projects.featured', 'projects.taxonomy',
        ]);
        $this->invalidateOnChange(Post::class, ['posts.list', 'posts.featured']);
        $this->invalidateOnChange(PostCategory::class, [
            'posts.list', 'posts.featured', 'posts.taxonomy',
        ]);
        $this->invalidateOnChange(Tag::class, ['posts.list', 'posts.featured']);
        $this->invalidateOnChange(Setting::class, [
            'settings.public', 'career.list', 'career.options',
        ]);
        $this->invalidateOnChange(CareerJob::class, ['career.list', 'career.options']);
    }

    /** @param class-string<Model> $modelClass */
    private function invalidateOnChange(string $modelClass, array $scopes): void
    {
        $invalidate = static fn () => PublicContentCache::invalidate(...$scopes);

        $modelClass::saved($invalidate);
        $modelClass::deleted($invalidate);
    }
}
