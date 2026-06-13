#!/bin/bash
# =============================================================
# PHP Container Entrypoint Script
# =============================================================
# This script runs when the PHP container starts.
# If Laravel is not yet installed, it creates a placeholder
# response so nginx doesn't return a 502.
# Then it starts PHP-FPM.
# =============================================================

set -e

cd /var/www/html

if [ ! -f artisan ]; then
    echo ""
    echo "⚠️  Laravel not installed yet."
    echo "   Run: make setup-backend"
    echo ""

    # Create a placeholder PHP response so nginx returns something useful
    mkdir -p public
    cat > public/index.php << 'PHPEOF'
<?php

header('Content-Type: application/json');
http_response_code(503);
echo json_encode([
    'status'  => 'pending',
    'message' => 'Laravel is not installed yet. Run: make setup-backend',
], JSON_PRETTY_PRINT);
PHPEOF

else
    echo "✅ Laravel detected. Starting PHP-FPM..."

    # Ensure storage directories exist and are writable
    mkdir -p storage/framework/{sessions,views,cache}
    mkdir -p storage/logs
    mkdir -p bootstrap/cache
    chmod -R 775 storage bootstrap/cache 2>/dev/null || true
fi

# Start PHP-FPM (replace this process)
exec php-fpm
