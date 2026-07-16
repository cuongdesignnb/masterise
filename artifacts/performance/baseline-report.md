# Baseline hiệu năng public

Ngày đo: 2026-07-16. Nguồn: production public trước khi tối ưu.

## API

| Endpoint | Status | Payload | TTFB | Tổng thời gian | Item |
|---|---:|---:|---:|---:|---:|
| `/api/v1/projects` | 200 | 4.895.396 B | 0,937 s | 2,541 s | 9 |
| `/api/v1/projects/featured` | 200 | 4.851.265 B | 0,413 s | 1,372 s | - |
| `/api/v1/posts` | 200 | 20.415.114 B | 0,569 s | 2,602 s | 9 |
| `/api/v1/posts?per_page=100` | 200 | 24.233.137 B | 0,571 s | 2,850 s | - |
| `/api/v1/settings/public` | 200 | 30.517 B | 0,346 s | - | - |
| Project categories | 200 | 808 B | - | - | - |
| Regions | 200 | 1.009 B | - | - | - |
| Project statuses | 200 | 1.334 B | - | - | - |

Payload dự án list chứa content, gallery, floor plan, chính sách, tiến độ, testimonial, FAQ và SEO. Payload bài viết list chứa toàn bộ `intro_content`, `content`, media, SEO và dữ liệu AI; một bài có content hơn một triệu ký tự.

## Trang

| Trang | Status | HTML | TTFB | Tổng thời gian |
|---|---:|---:|---:|---:|
| `/` | 200 | 49.152 B | 0,477 s | - |
| `/du-an` | 200 | 14.916 B | 0,274 s | - |
| `/tin-tuc` | 200 | 2.089.936 B | 3,750 s | 4,144 s |
| `/lien-he` | 200 | 71.065 B | 0,530 s | - |

`/du-an` chưa có danh sách trong HTML đầu tiên. Audit source xác nhận trang chủ, dự án và tin tức đều gọi list API sau hydration; `AllProjectsGrid` dùng `per_page=100`, còn `GlobalContactForm` dùng project list đầy đủ với `per_page=50`. API client thêm `_ts` vào GET có token.

## Giới hạn phép đo

- Query count, cache hit/miss production: `BLOCKED` vì không có quyền profiler production.
- Lighthouse/LCP/CLS/INP production trước sửa: `BLOCKED` vì không có trace Lighthouse trước thay đổi.
- Số request browser baseline chính xác: `BLOCKED`; source audit xác nhận có waterfall client-fetch nhưng không ghi số giả.
