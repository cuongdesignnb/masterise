#!/bin/bash
set -e

echo "========================================"
echo "  Setting up Laravel Backend"
echo "========================================"

cd /var/www/html

# Check if Laravel is already installed
if [ -f artisan ]; then
    echo "Laravel already installed. Running migrations..."
    composer install --no-interaction --optimize-autoloader
    php artisan migrate --force
    echo ""
    echo "========================================"
    echo "  ✅ Laravel already set up!"
    echo "========================================"
    exit 0
fi

# Clean out placeholder files (keep .gitkeep won't interfere)
echo "[1/8] Preparing directory..."
# Remove any placeholder index.php if it exists
rm -f public/index.php

# Install Laravel
echo "[2/8] Creating Laravel project..."
composer create-project laravel/laravel /tmp/laravel-install --no-interaction --prefer-dist

# Move Laravel files into the mounted volume
echo "[3/8] Moving Laravel files into place..."
# Use rsync-like approach: copy everything from temp to /var/www/html
cp -a /tmp/laravel-install/. /var/www/html/
rm -rf /tmp/laravel-install

# Install additional packages
echo "[4/8] Installing additional packages..."
composer require laravel/sanctum spatie/laravel-permission intervention/image-laravel --no-interaction

# Publish configs
echo "[5/8] Publishing package configs..."
php artisan vendor:publish --provider="Laravel\Sanctum\SanctumServiceProvider" --force
php artisan vendor:publish --provider="Spatie\Permission\PermissionServiceProvider" --force

# Configure environment
echo "[6/8] Configuring environment..."
cat > .env << 'ENVEOF'
APP_NAME="Masterise Homes API"
APP_ENV=local
APP_KEY=
APP_DEBUG=true
APP_URL=http://localhost:8747
FRONTEND_URL=http://localhost:8746

DB_CONNECTION=mysql
DB_HOST=mysql
DB_PORT=3306
DB_DATABASE=masterise_homes
DB_USERNAME=masterise
DB_PASSWORD=masterise_secret

CACHE_STORE=redis
QUEUE_CONNECTION=redis
SESSION_DRIVER=redis

REDIS_HOST=redis
REDIS_PORT=6379

SANCTUM_STATEFUL_DOMAINS=localhost:8746
SESSION_DOMAIN=localhost

FILESYSTEM_DISK=public
ENVEOF

# Generate application key
echo "[7/8] Generating app key..."
php artisan key:generate --force

# Wait for MySQL to be ready before running migrations
echo "[8/8] Waiting for MySQL..."
MAX_RETRIES=30
RETRY_COUNT=0
until php artisan migrate --force 2>/dev/null; do
    RETRY_COUNT=$((RETRY_COUNT + 1))
    if [ $RETRY_COUNT -ge $MAX_RETRIES ]; then
        echo "⚠️  MySQL not ready after ${MAX_RETRIES} attempts. Skipping migrations."
        echo "   Run manually: docker compose exec php php artisan migrate"
        break
    fi
    echo "  Waiting for MySQL... (attempt $RETRY_COUNT/$MAX_RETRIES)"
    sleep 2
done

# Create storage link
php artisan storage:link 2>/dev/null || true

# Set permissions
chown -R www-data:www-data /var/www/html/storage 2>/dev/null || true
chmod -R 775 /var/www/html/storage
chown -R www-data:www-data /var/www/html/bootstrap/cache 2>/dev/null || true
chmod -R 775 /var/www/html/bootstrap/cache

echo ""
echo "========================================"
echo "  ✅ Laravel setup complete!"
echo "========================================"
echo "  API URL: http://localhost:8747"
echo "  Run: docker compose exec php php artisan tinker"
echo "========================================"
