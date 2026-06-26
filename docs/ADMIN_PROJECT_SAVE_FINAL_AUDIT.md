# Admin Project Save Final Audit

## Mục tiêu

Khóa lại luồng quản trị dự án để dữ liệu sau khi bấm "Lưu thay đổi" luôn được ghi DB, trả về từ backend bản mới nhất, rồi frontend đọc lại từ API admin trước khi hiển thị tiếp.

## Endpoint bắt buộc

- Danh sách admin: `GET /api/v1/admin/projects`
- Chi tiết admin khi bấm sửa: `GET /api/v1/admin/projects/{id}`
- Lưu tạo mới: `POST /api/v1/projects`
- Lưu cập nhật: `PUT /api/v1/projects/{id}`
- Đọc lại sau lưu: `GET /api/v1/admin/projects/{id}`

Admin không dùng endpoint public `GET /api/v1/projects/{slug}` để đổ dữ liệu form, vì endpoint public có thể ẩn dự án nháp/chưa publish hoặc thiếu trường quản trị.

## Backend

- `ProjectController@store` và `ProjectController@update` gọi `$project->refresh()` sau khi sync category và lưu SEO.
- Response sau lưu luôn `load(['categories', 'seoMeta', 'developerRelation', 'locationRelation'])`.
- Response admin được bọc `noStore` để tránh cache trình duyệt/proxy giữ bản cũ.
- Route admin đã có trong `backend/routes/api.php`:
  - `GET /admin/projects`
  - `GET /admin/projects/{id}`

Nếu production còn báo 404 với `/api/v1/admin/projects`, nguyên nhân gần như chắc là backend chưa deploy code mới hoặc Laravel đang cache route cũ. Cần chạy `php artisan optimize:clear` trên container PHP sau deploy.

## Frontend

- Danh sách admin gọi `/admin/projects`.
- Bấm sửa gọi `/admin/projects/{id}` rồi đổ form qua `fillProjectForm(project)`.
- Sau save, frontend log payload/response/fresh detail trong môi trường dev.
- Production có thể bật log tạm bằng:

```js
localStorage.setItem('mh_project_save_debug', '1')
```

- Sau save thành công, frontend gọi lại `/admin/projects/{id}`, cập nhật cache danh sách, cập nhật `editingProject`, và đổ lại toàn bộ form bằng bản fresh.
- Form không tự đóng sau save trong giai đoạn audit để người nhập kiểm tra ngay dữ liệu vừa được server trả lại.

## Nhóm dữ liệu đã bao phủ

- Thông tin chung, trạng thái, developer/location.
- Giá, diện tích, pháp lý, quy mô, bàn giao.
- Hero, gallery, brochure, video, VR tour, ảnh bản đồ.
- SEO meta và schema.
- Quick cards, facts, stats, kết nối, tiện ích chi tiết.
- Lý do đầu tư, đánh giá khách hàng, FAQ.
- Tabs mặt bằng, danh sách mặt bằng, bảng giá, chính sách bán hàng, tiến độ.

