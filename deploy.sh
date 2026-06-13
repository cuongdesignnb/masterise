#!/bin/bash
set -e

echo "========================================"
echo "  Masterise Homes - Deploy"
echo "========================================"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Step 1: Pull latest code
echo -e "${YELLOW}[1/6] Pulling latest code...${NC}"
git pull origin main

# Step 2: Copy env if not exists
if [ ! -f .env.production ]; then
  echo -e "${YELLOW}[!] .env.production not found. Copying from example...${NC}"
  cp .env.production.example .env.production
  echo -e "${YELLOW}[!] IMPORTANT: Edit .env.production with real credentials before continuing!${NC}"
  exit 1
fi

# Step 3: Build and start containers
echo -e "${YELLOW}[2/6] Building Docker containers...${NC}"
docker compose -f docker-compose.prod.yml up -d --build

# Step 4: Install backend dependencies
echo -e "${YELLOW}[3/6] Installing backend dependencies...${NC}"
docker compose -f docker-compose.prod.yml exec php composer install --no-dev --optimize-autoloader --no-interaction

# Step 5: Run migrations and seed
echo -e "${YELLOW}[4/6] Running migrations...${NC}"
docker compose -f docker-compose.prod.yml exec php php artisan migrate --force

# Step 6: Optimize Laravel
echo -e "${YELLOW}[5/6] Optimizing Laravel...${NC}"
docker compose -f docker-compose.prod.yml exec php php artisan config:cache
docker compose -f docker-compose.prod.yml exec php php artisan route:cache
docker compose -f docker-compose.prod.yml exec php php artisan view:cache
docker compose -f docker-compose.prod.yml exec php php artisan storage:link

# Step 7: Done
echo -e "${YELLOW}[6/6] Setting permissions...${NC}"
docker compose -f docker-compose.prod.yml exec php chown -R www-data:www-data /var/www/html/storage
docker compose -f docker-compose.prod.yml exec php chmod -R 775 /var/www/html/storage

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  ✅ Deploy completed successfully!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo "  Frontend: http://localhost:${FRONTEND_PORT:-3000}"
echo "  API:      http://localhost:${API_PORT:-8747}"
echo ""
