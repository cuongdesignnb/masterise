.PHONY: up down build fresh migrate seed tinker logs setup-backend test

# Local development
up:
	docker compose up -d

down:
	docker compose down

build:
	docker compose up -d --build

restart:
	docker compose restart

logs:
	docker compose logs -f

logs-php:
	docker compose logs -f php

logs-nginx:
	docker compose logs -f nginx

# Laravel commands
migrate:
	docker compose exec php php artisan migrate

seed:
	docker compose exec php php artisan db:seed

fresh:
	docker compose exec php php artisan migrate:fresh --seed

tinker:
	docker compose exec php php artisan tinker

artisan:
	docker compose exec php php artisan $(cmd)

composer:
	docker compose exec php composer $(cmd)

setup-backend:
	docker compose exec php sh /docker-scripts/setup-laravel.sh

test:
	docker compose exec php php artisan test

# Database
db:
	docker compose exec mysql mysql -u masterise -pmasterise_secret masterise_homes

# Frontend (runs outside Docker for hot reload)
dev:
	npm run dev -- -p 8746

# Production deploy
deploy:
	bash deploy.sh

# Clean everything
clean:
	docker compose down -v --remove-orphans
	docker system prune -f
