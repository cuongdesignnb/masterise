# Báo cáo Audit Hệ thống Quản trị Masterise Homes (Phase 0)

Báo cáo này được thiết lập nhằm rà soát toàn bộ hiện trạng mã nguồn của dự án Masterise Homes bao gồm cả frontend (Next.js) và backend (Laravel API) để làm cơ sở triển khai các giai đoạn tiếp theo theo lộ trình.

---

## 1. Hiện trạng các Module Hệ thống

### 1.1 Module đã tồn tại & Hoạt động
1. **Hạ tầng Docker & Deployment:**
   * Local development: MySQL, Redis, phpMyAdmin, Laravel backend (Nginx + PHP-FPM) và Next.js Frontend.
   * Cổng kết nối (Port scheme): Frontend (`8746`), Nginx API (`8747`), MySQL (`8748`), Redis (`8749`), phpMyAdmin (`8750`).
   * Tự động hóa: `deploy.sh` chạy 1 lệnh để kéo từ git và rebuild trên production.
2. **Auth & Identity:**
   * Sử dụng Laravel Sanctum để xác thực Token.
   * Tích hợp Spatie Laravel Permission để quản lý vai trò và phân quyền (RBAC).
   * Seed sẵn 6 Role: `super_admin`, `admin`, `marketing`, `sale_manager`, `sale`, `customer` và 30+ permissions liên quan.
3. **Quản lý Dự án (Project Management):**
   * Migration, Model `Project` & `ProjectCategory`, Controller và các endpoint API CRUD.
   * Frontend: Giao diện danh sách dự án, bộ lọc và Slide Drawer thêm/sửa dự án gồm 5 tab thông tin (Thông tin chung, Vị trí & Giá, Nội dung & Tiện ích, Ảnh & Brochure, Cấu hình SEO).
4. **Quản lý Tin tức (News & Blog):**
   * Migration, Model `Post` & `PostCategory`, Controller và các endpoint API CRUD.
   * Frontend: Danh sách bài viết, lọc theo trạng thái/chuyên mục và Slide Drawer soạn thảo tin tức + SEO Meta.
5. **Thư viện Media:**
   * Model `Media` + Controller.
   * Frontend: Quản lý media, tải ảnh trực quan, tự convert WebP.
   * `MediaSelectModal` dùng chung để chọn ảnh cho Dự án và Tin tức.
6. **Module Leads & Lịch hẹn (CRM):**
   * Model `Lead` & `LeadNote`, Model `Appointment`.
   * Frontend: CRM Leads (danh sách, phân công chuyên viên, ghi chú) và Quản lý Lịch hẹn (duyệt, hủy, hoàn thành).
7. **Báo cáo Dashboard:**
   * Endpoint `/reports/stats` thống kê nhanh tổng số dự án, tin tức, lịch hẹn và leads mới.

### 1.2 Module còn thiếu hoặc chưa hoàn thiện (Cần phát triển tiếp)
1. **Quản lý Sản phẩm / Giỏ hàng chi tiết (Property Units):**
   * Hệ thống chưa có các Model: `Tower`, `Floor`, `UnitType`, `PropertyUnit`, `UnitStatusHistory`, `UnitPriceHistory` để quản lý sản phẩm cụ thể (Căn hộ, Duplex, Villa...).
2. **Hệ thống SEO Center chuyên sâu:**
   * Thiếu bảng và tính năng quản lý Redirect 301/302 (`seo_redirects`).
   * Thiếu tự động sinh Sitemap (`sitemap.xml`) và file cấu hình `robots.txt` động từ database.
   * Thiếu Health Check SEO để quét các trang thiếu meta title/description hoặc ảnh OG.
3. **Mở rộng CRM Leads & Sales Pipeline:**
   * Chưa có bảng `lead_sources` để phân loại kênh (Facebook, Google, Website).
   * Chưa có bảng `pipeline_stages` để theo dõi cơ hội kinh doanh theo pipeline chuyên nghiệp (New -> Contacted -> Negotiating -> Closed).
   * Chưa có lưu vết lịch sử tương tác chăm sóc khách hàng (`lead_activities`).
4. **Landing Page Builder / CMS Block Builder:**
   * Thiếu Model `LandingPage` và UI Builder động để Marketing tự thiết kế trang đích kéo traffic.
5. **Form Builder & Popups/Banners:**
   * Chưa có hệ thống tạo Form động, Popup quảng cáo theo rules và banner quảng cáo.
6. **Hệ thống Nhật ký vận hành (Audit Logs):**
   * Chưa có bảng `audit_logs` để ghi nhận các thao tác nhạy cảm (Đổi giá căn hộ, đổi trạng thái giỏ hàng, phân công Lead...).

---

## 2. Danh sách API Endpoint hiện có & cần bổ sung

### 2.1 API đã có
* **Auth:** `/auth/login`, `/auth/register`, `/auth/logout`, `/auth/me`, `/auth/profile`, `/auth/change-password`.
* **Projects:** `GET /projects`, `GET /projects/{slug}`, `POST /projects` (Admin), `PUT /projects/{id}` (Admin), `DELETE /projects/{id}` (Admin).
* **Posts:** `GET /posts`, `GET /posts/{slug}`, `POST /posts` (Admin), `PUT /posts/{id}` (Admin), `DELETE /posts/{id}` (Admin).
* **Leads:** `POST /leads/submit`, `GET /leads` (Admin), `PATCH /leads/{id}/status` (Admin), `PATCH /leads/{id}/assign` (Admin).
* **Appointments:** `POST /appointments` (Book), `GET /appointments` (Admin), `PATCH /appointments/{id}/status` (Admin).
* **Media:** `GET /media` (Admin), `POST /media/upload` (Admin), `DELETE /media/{id}` (Admin).
* **Settings:** `GET /settings/public`, `GET /settings` (Admin), `PUT /settings` (Admin).
* **SEO Meta:** `GET /seo/by-path`, `POST /seo` (Admin).

### 2.2 API cần bổ sung
* **Property Units (Giỏ hàng):**
  * `GET /api/v1/units` & `GET /api/v1/units/{slug}` (Public)
  * `GET/POST/PUT/DELETE /api/v1/admin/units` (Admin CRUD)
  * `POST /api/v1/admin/units/import` & `GET /api/v1/admin/units/export` (Excel)
  * `PATCH /api/v1/admin/units/{id}/status` & `PATCH /api/v1/admin/units/{id}/price`
* **SEO Center & Redirects:**
  * `GET/POST/PUT/DELETE /api/v1/admin/seo/redirects`
  * `GET /api/v1/admin/seo/health-check`
  * `GET /sitemap.xml` & `GET /robots.txt` (Public)
* **User Management (Quản lý Thành viên Admin):**
  * `GET/POST/PUT/DELETE /api/v1/admin/users`
* **CRM Lead Pipeline & Activities:**
  * `POST /api/v1/admin/leads/{id}/activities`
  * `PATCH /api/v1/admin/leads/{id}/stage` (Pipeline)
* **Landing Page Builder:**
  * `GET/POST/PUT/DELETE /api/v1/admin/landing-pages`

---

## 3. Cấu trúc thư mục hiện tại

### Thư mục Backend (Laravel API): `backend/`
* `app/Http/Controllers/Api/`: Nơi chứa toàn bộ Controller REST API.
* `app/Models/`: Chứa các Model Eloquent.
* `database/migrations/`: Các migrations tạo bảng (hiện có 20 file).
* `database/seeders/`: Chứa `DatabaseSeeder` và `RolesAndPermissionsSeeder`.
* `routes/api.php`: Khai báo toàn bộ endpoint.

### Thư mục Next.js Frontend: `src/`
* `src/app/admin/`: Các route trang quản trị (Overview, dự án, tin tức, leads, media, lịch hẹn).
* `src/app/tai-khoan/`: Customer portal.
* `src/components/admin/`: Component dùng chung cho admin (như `MediaSelectModal`).
* `src/lib/api.ts`: API client dùng fetch và react-query.
* `src/types/api.ts`: Khai báo interface TypeScript cho API data.

---

## 4. Phân tích Rủi ro & Đề xuất Kế hoạch triển khai

### 4.1 Rủi ro kỹ thuật
* **Xung đột phiên bản Node.js & Docker volume:** Chạy frontend Next.js dev trong Docker volume trên Windows có thể làm chậm quá trình biên dịch (HMR). Giải pháp: Cung cấp tùy chọn chạy Node ngoài máy host thông qua port cấu hình sẵn `8746` hoặc trong container sử dụng anonymous volumes để tránh lock `node_modules`.
* **Phân mảnh cấu hình SEO:** Dự án và Bài viết có SEO meta riêng, các trang tĩnh lại dùng SEO meta theo đường dẫn (path). Cần có một service chung để gộp (merge) SEO hoặc trả về SEO chính xác nhất theo URL để tránh trùng Canonical.

### 4.2 Thứ tự triển khai ưu tiên đề xuất (Sprints)
* **Sprint 1 (Chuẩn hóa Admin & Nền tảng):** Hoàn tất phân quyền thành viên, sidebar admin và giao diện cài đặt hệ thống.
* **Sprint 2 (Giỏ hàng & Căn hộ - Property Units):** Thiết lập database, migrations cho căn hộ, tòa nhà, mặt bằng tầng và tích hợp tính năng Import/Export Excel.
* **Sprint 3 (SEO Center & Redirects):** Quản lý redirect 301, SEO Health check và tự động sinh Sitemap động.
* **Sprint 4 (CRM Pipeline & Landing Pages):** Xây dựng sales pipeline và Landing page builder kéo traffic.
