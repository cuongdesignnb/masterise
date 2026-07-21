# SEO & Schema Hardening RC3 — QA Walkthrough

## SHA được kiểm thử

`aae40a369c6f9dac62a5dfc742870084e1a0ad96`

Các log trong `test-logs/` được sinh tự động bởi `scripts/run-seo-rc3-qa.ps1`. Mỗi file có timestamp UTC, commit SHA, command và exit code. Không sử dụng lại log RC2.

## Commands

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File scripts/run-seo-rc3-qa.ps1
```

Runner thực hiện theo thứ tự:

1. `npm ci`
2. `npm run lint`
3. `npm run build`
4. `npx tsc --noEmit`
5. Bật Docker local cho QA.
6. Composer install.
7. `migrate:fresh` trên SQLite testing riêng trong `/tmp` của PHP container.
8. Full backend tests.
9. Asset validation qua filesystem và local HTTP.
10. SEO smoke với fixture local có thật.
11. `docker compose down` trong `finally`.

## Kết quả

| Kiểm tra | Kết quả |
|---|---|
| npm ci | Pass, exit 0 |
| Frontend lint | Pass, 0 errors, 406 warnings |
| TypeScript | Pass, exit 0 |
| Production build | Pass, exit 0 |
| Composer install | Pass, exit 0 |
| Testing migration | Pass, exit 0 |
| Backend tests | 191 pass, 892 assertions |
| SEO smoke | 248 pass, 0 fail, 3 skip |
| Asset validation | Pass, exit 0 |
| Docker sau QA | Đã tắt toàn bộ stack |

Ba skip là fixture không tồn tại trong local DB: approved project review, active job và expired job. Không seed dữ liệu giả. Backend tests kiểm tra public review scope và expired/closed job eligibility.

## Visual evidence

- `screenshots/homepage-desktop.png`: homepage local.
- `screenshots/project-mobile.png`: project detail tại viewport mobile 375×812.
- `screenshots/og-default-browser.png`: OG JPEG render qua HTTP.
- `screenshots/twitter-image-browser.png`: Twitter image 1200×630 render qua HTTP.
- `screenshots/admin-project-reviews-login.png`: admin review route chuyển về login khi chưa có session.

Browser DOM checks:

- Homepage: title, description, canonical, `index,follow`, một H1, JSON-LD parse được.
- Project detail: title, description, canonical, `index,follow`, một H1, graph gồm WebSite/WebPage/BreadcrumbList/Place/Residence với flags schema nhạy cảm mặc định tắt.
- Admin: `noindex,nofollow`.

## Asset policy

Artwork là neutral operator/domain artwork, chưa phải logo thương hiệu chính thức. Giữ `seo_site_entity_enabled=false` cho tới khi owner phê duyệt.

## Docker policy

Docker chỉ bật trong khối backend/integration QA. Runner dùng `finally` để gọi `docker compose down`; kiểm tra sau runner trả danh sách container rỗng.
