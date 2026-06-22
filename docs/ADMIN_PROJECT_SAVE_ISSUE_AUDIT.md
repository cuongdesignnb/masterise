# Audit lỗi lưu dự án trong Admin

## API đang được gọi

- Tạo dự án: `POST /api/v1/projects`
- Cập nhật dự án: `PUT /api/v1/projects/{id}`
- Frontend gọi qua `src/lib/api.ts`, tự gắn Bearer token từ `localStorage.mh_token`.

## Payload mẫu khi lưu

Frontend gửi một object dự án gồm các nhóm chính:

- Thông tin cơ bản: `name`, `slug`, `code`, `status`, `sales_status`, `is_published`
- Nội dung hiển thị: `description`, `content`, `hero_subtitle`, `badge_text`
- Vị trí: `location`, `address`, `province`, `district`, `ward`, `lat`, `lng`, `map_image_url`, `connectivity`
- Media: `thumbnail`, `banner_image`, `gallery`, `brochure_url`, `video_url`, `virtual_tour_url`
- Dữ liệu lặp: `quick_cards`, `project_facts`, `project_stats`, `amenity_details`, `floor_tabs`, `floor_plans`, `price_rows`, `policy_cards`, `project_timeline`, `investment_reasons`, `project_testimonials`, `project_faqs`
- SEO: `seo_title`, `seo_description`, `seo_keywords`, `schema_price`, `schema_price_currency`, `schema_availability`

## Nguyên nhân chính có thể làm admin tưởng không lưu được

1. Nút `Lưu dự án` ở frontend bị disable khi thiếu `formPriceText`.
   - Đây là nguyên nhân UX lớn nhất: lưu nháp đáng lẽ chỉ cần tên dự án, nhưng admin bị chặn vì chưa nhập giá.

2. Frontend chỉ dùng một hành động `Lưu dự án`.
   - Chưa tách rõ `Lưu nháp`, `Lưu & xem trước`, `Xuất bản`.
   - Admin không biết mình đang lưu nháp hay xuất bản.

3. API lỗi 422 chỉ hiện `alert`.
   - Backend trả `Validation error` và `errors`, nhưng UI không liệt kê field lỗi trong form.

4. Giá trị `sales_status=handing_over` không khớp backend.
   - Backend chỉ nhận: `coming_soon`, `selling`, `sold_out`, `handover`.
   - Giá trị sai có thể gây lỗi validation 422.

## File đã sửa

- `src/app/admin/du-an/page.tsx`
- `src/components/project-detail/ProjectDetailClient.tsx`

## Cách fix đã áp dụng

1. Tách hành động lưu:
   - `Lưu nháp`
   - `Lưu thay đổi`
   - `Lưu & xem trước`
   - `Xuất bản` / `Cập nhật xuất bản`

2. Lưu nháp chỉ chặn khi thiếu tên dự án.
   - Nếu thiếu slug, frontend tự sinh slug từ tên dự án.

3. Xuất bản có checklist cảnh báo:
   - Thiếu tên dự án
   - Thiếu đường dẫn tĩnh
   - Thiếu mô tả ngắn
   - Thiếu ảnh đại diện
   - Thiếu ảnh Hero
   - Thiếu trạng thái mở bán
   - Thiếu tiêu đề SEO
   - Thiếu mô tả SEO

4. Lỗi API được hiển thị trong form.
   - Có banner lỗi tiếng Việt.
   - Có danh sách field lỗi trả về từ backend.

5. Sửa `sales_status`.
   - Bỏ option `handing_over`.
   - Dùng `sold_out` và `handover`, đúng validation backend.

6. Mở rộng editor Admin.
   - Không còn cảm giác drawer hẹp.
   - Editor gần full màn hình, có sidebar section bên trái và vùng form rộng hơn.

## Việc còn nên làm tiếp

- Tách hẳn thành route riêng: `/admin/du-an/them-moi` và `/admin/du-an/[id]/chinh-sua`.
- Thêm autosave backend định kỳ cho dự án đã có ID.
- Thêm preview riêng cho dự án chưa xuất bản.
