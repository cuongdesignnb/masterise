# QA report: Project type vs marketing label

Date: 2026-07-14

## URLs kiểm thử local

- Frontend local URL: `http://localhost:8746`
- Backend local API URL: `http://localhost:8747/api/v1`
- Admin URL: `http://localhost:8746/admin/du-an`
- Docker services: frontend, Nginx, PHP, MySQL và Redis đều hoạt động trong lúc QA.

## A. Audit ban đầu

- Project type: `Căn Hộ Cao Cấp`, `Biệt Thự & Dinh Thự`, `Shophouse thương mại`.
- Collection: `Masterise Collection` (`masterise-colletion`) và `Lumiere Series`.
- Năm dự án ban đầu chỉ có collection, chưa có project type thực:
  - `masterise-grand-view`
  - `masterise-central-point`
  - `masterise-riverside`
  - `lumiere-riverside`
  - `lumiere-midtown`
- Cả năm dự án đều có nội dung/scale căn hộ cao cấp và không có bằng chứng shophouse, nên mapping an toàn là `can-ho-cao-cap`.

## B. Migration backfill

- Migration: `2026_07_14_000012_assign_missing_project_types.php`.
- Migration status cuối: `Ran`.
- Số relation được thêm: 5.

| Dự án | Project type sau backfill | Collection được giữ |
| --- | --- | --- |
| Masterise Grand View | `can-ho-cao-cap` | `masterise-colletion` |
| Masterise Central Point | `can-ho-cao-cap` | `masterise-colletion` |
| Masterise Riverside | `can-ho-cao-cap` | `masterise-colletion` |
| Lumiere Riverside | `can-ho-cao-cap` | `lumiere-series` |
| Lumiere Midtown | `can-ho-cao-cap` | `lumiere-series` |

- Tổng project local sau phục hồi và backfill: 10.
- Project còn thiếu `project_type`: 0.
- Duplicate pivot `(project_id, project_category_id)`: 0.
- Collection bị mất: 0.
- `project_status`, `project_label` và `location_id` của năm dự án không bị migration backfill tự ý thay đổi.

## C. Public QA

### Responsive

- 375 × 812: PASS, không tràn ngang; category filter hiển thị `Căn hộ cao cấp (10)`.
- 768 × 1024: PASS, bố cục và card không vỡ.
- 1024 × 768: PASS, default và combined filter hiển thị đúng.
- 1440 × 900: PASS, grid desktop và danh sách sau backfill hiển thị đúng.

Ảnh QA:

- `responsive-375-default.png`
- `responsive-375-category-filter.png`
- `responsive-768-default.png`
- `responsive-768-category-filter.png`
- `responsive-1024-default.png`
- `responsive-1024-combined-filter.png`
- `responsive-1440-default.png`
- `responsive-1440-category-filter.png`
- `five-projects-after-backfill-row-2.png`

### API và filter

- Endpoint category thực tế của ứng dụng: `GET /project-categories`.
- Category endpoint chỉ trả project type có project published:
  - `can-ho-cao-cap`: 10.
  - `shophouse-thuong-mai`: 1.
  - Collection và project type có count 0 không được trả ra.
- `GET /projects?category=can-ho-cao-cap`: 10 project, 10 slug duy nhất, có đủ năm dự án vừa backfill.
- `GET /projects?category=can-ho-cao-cap&project_status=selling`: 6 project.
- `project_label=HOT` không thay đổi kết quả category: vẫn 10 project và cùng tập slug.
- Frontend dùng query mới `project_status`; không phát sinh query mới bằng `status` hoặc `sales_status` cho trang dự án.
- Combined region `region=mien-nam`: 0 project trên seed local hiện tại vì cả 10 project chưa có `location_id`; đây là dữ liệu vùng miền local còn thiếu, không phải lỗi backfill loại hình.
- Console public: không thấy uncaught exception, hydration error, duplicate-key error hoặc request loop. Có warning Next Image về parent `position: static` và warning thiếu `data-scroll-behavior="smooth"` trên `<html>`.
- Network: các API local category/project/filter phản hồi thành công sau khi database local được phục hồi; không thấy request loop.

## D. Admin QA

Trạng thái: **BLOCKED — không đánh dấu PASS**.

- Trang đăng nhập local đã được mở đúng tại `http://localhost:8746/admin/du-an`.
- Console báo `401 Unauthenticated` khi `restoreSession()` đọc token local cũ. `AuthContext` bắt lỗi và xóa session; đây là stale local token, không phải lỗi migration.
- Khi tiếp tục bằng Chrome thủ công, công cụ trả về cửa sổ mang metadata local nhưng ảnh thực tế đang ở `https://masterise-homes.net.vn/admin`. QA đã dừng ngay, không đăng nhập, không lưu và không thay đổi production.
- Vì không có browser local đáng tin cậy sau đăng nhập, các field Loại hình dự án, Nhãn marketing, Collection và save/reload chưa được nghiệm thu trực quan.
- Không tạo ảnh admin giả. Bốn file ảnh admin yêu cầu không được tạo.
- Automated coverage liên quan vẫn PASS:
  - Admin save/reload trả dữ liệu mới.
  - Admin create/update/reload project type.
  - Update project type giữ collection.
  - `project_label` không tham gia public filter.

## E. Test tự động

- Frontend lint (`npm run lint -- --quiet`): PASS, 0 error.
- TypeScript (`npx tsc --noEmit`): PASS.
- Production build (`npm run build`): PASS.
- Static pages: 43/43 generated.
- Backend full suite cuối bằng lệnh chuẩn `php artisan test`: 79 tests PASS, 366 assertions.
- Targeted backfill suite nằm trong full suite: 3 tests, 33 assertions.
- `php artisan route:list`: PASS, 137 routes.
- `php artisan migrate:status`: PASS; migration `000011` và `000012` đều `Ran`.
- `git diff --check`: PASS.

### Test isolation đã sửa

- Docker export biến DB MySQL nên `phpunit.xml` trước đó không ép được SQLite và lần chạy đầu đã chạm database local.
- Database local được dựng lại từ migrations + seeders, chạy lại backfill và xác minh về đúng 10 project, thiếu type = 0, duplicate = 0.
- Đã thêm `force="true"` cho `DB_CONNECTION`, `DB_DATABASE` và `DB_URL` trong `backend/phpunit.xml`.
- Vì biến môi trường cấp container vẫn có thể thắng XML, `backend/tests/TestCase.php` ép lại `APP_ENV` và ba biến DB trước khi Laravel bootstrap. Đây là lớp cách ly quyết định.
- `ProjectSeeder` cũng gán `can-ho-cao-cap` cho năm project seed tương ứng để clean install/clean seed không phụ thuộc migration backfill đã chạy trước seeder.
- Full suite cuối được chạy lại bằng chính lệnh chuẩn và PASS trên SQLite `:memory:`; API MySQL local vẫn trả đúng 10 project sau test.

## F. Lỗi công cụ QA

Browser automation runtime không sử dụng được do:

```text
Cannot redefine property: process
```

Computer Use ở lần QA trước đã dừng an toàn vì chưa xác định chắc chắn URL Chrome trên Windows.

Ở lần tiếp tục, URL local được xác định từ `package.json` và `docker-compose.yml`, nhưng Chrome target sau đó hiển thị production không khớp metadata cửa sổ. Không có thao tác ghi nào được thực hiện trên production.

QA public responsive được thực hiện thủ công bằng trình duyệt tại các viewport yêu cầu. Đây là lỗi runtime/cửa sổ công cụ QA, không phải lỗi production của ứng dụng.

## Cảnh báo không chặn

- Next.js build không cache được payload projects khoảng 6.44 MB và posts khoảng 29.34 MB do vượt giới hạn 2 MB; không refactor cache trong task này.
- Docker Compose cảnh báo trường `version` đã obsolete.
- Host PHP có thể cảnh báo thiếu OCI/Firebird tùy chọn; dự án không sử dụng hai database này.

## Git safety

- Không stage file.
- Không commit.
- Không push.
- Không deploy.
- Không đưa `.env`, secret, log, cache, database local, `.next`, `node_modules`, `vendor` hoặc build tạm vào Git.
