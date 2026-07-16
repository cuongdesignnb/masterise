# Báo cáo sau tối ưu

Ngày đo local production-like: 2026-07-17. Backend Laravel + MySQL + Redis trong Docker, frontend Next.js dev local.

## Kết quả API

| API | Trước production | Sau local | Cải thiện payload |
|---|---:|---:|---:|
| Project list mặc định | 4.895.396 B | 14.743 B | 99,70% |
| Post list mặc định | 20.415.114 B | 10.177 B | 99,95% |
| Post list `per_page=100` | 24.233.137 B | 13.703 B, cap 50 | 99,94% |
| Project options | full project list | 1.382 B | chỉ `id`, `name`, `slug` |

Warm local:

| Endpoint | Status | TTFB | Tổng thời gian | SQL cold | SQL warm |
|---|---:|---:|---:|---:|---:|
| `/api/v1/projects` | 200 | 0,153 s | 0,153 s | 6 | 0 |
| `/api/v1/posts` | 200 | 0,165 s | 0,165 s | 5 | 0 |
| `/api/v1/posts?per_page=100` | 200 | 0,099 s | 0,099 s | - | - |
| `/api/v1/projects/options` | 200 | 0,095 s | 0,095 s | - | - |
| `/api/v1/settings/public` | 200 | 0,153 s | 0,153 s | - | - |

Cold project request ngay sau restart PHP mất 7,259 s do khởi động container; warm cache ổn định dưới mục tiêu 600 ms.

## SSR và request

| Trang local | HTML | TTFB | Tổng thời gian | API public sau hydration |
|---|---:|---:|---:|---:|
| `/` | 53.535 B | 0,212 s | 0,214 s | 0 |
| `/du-an` | 69.205 B | 0,151 s | 0,155 s | 0 |
| `/tin-tuc` | 58.326 B | 0,367 s | 0,371 s | 0 |

HTML response có tên dự án/bài viết. Dữ liệu đầu tiên được server fetch song song và truyền xuống client; React Query dùng `initialData`, `staleTime` và không refetch khi mount/focus. Filter và pagination tiếp tục dùng URL.

## Cache và SQL

- Backend dùng versioned cache key theo toàn bộ query/filter, không dùng `Cache::flush()`.
- Model events invalidates list, featured, taxonomy, settings, options và career cache khi save/delete.
- Public list TTL 300 giây; featured 600 giây; taxonomy 900 giây; options 1.800 giây; settings 600 giây.
- Bổ sung composite index cho project public latest/featured/price và post type/featured theo published date.
- Nginx bật gzip vary, proxied, level 6 và thêm XML/SVG MIME.

## Ảnh và UX

- Card đã dùng `next/image`, `sizes` và aspect ratio cố định; hero đầu tiên dùng priority.
- Không preload hàng loạt ảnh dưới fold.
- Danh sách giữ dữ liệu cũ mờ nhẹ khi filter/page đang tải; layout card giữ kích thước ổn định.

## Giới hạn phép đo

- Lighthouse LCP/CLS/INP: `BLOCKED` trong môi trường QA hiện tại, không ghi số ước lượng.
- TTFB production sau deploy: `BLOCKED` cho tới khi người dùng triển khai commit mới.
- Các số trước/sau ở hai môi trường khác nhau, vì vậy dùng để xác nhận cấp độ cải thiện payload và kiến trúc, không phải benchmark hạ tầng tuyệt đối.
