<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Lệnh Deploy Production
Khi hoàn thành code và đẩy lên Git, hãy luôn cung cấp lệnh deploy inline chính xác sau cho người dùng:
`git pull origin main && docker compose -f docker-compose.prod.yml up -d --build frontend && docker compose -f docker-compose.prod.yml exec -T php php artisan migrate --force && rm -rf /www/server/nginx/proxy_cache_dir/* && nginx -s reload`
