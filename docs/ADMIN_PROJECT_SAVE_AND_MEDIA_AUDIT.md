# Audit lưu dữ liệu Admin dự án và Media Gallery

## Luồng API đang dùng

- Tạo dự án: `POST /api/v1/projects`
- Cập nhật dự án: `PUT /api/v1/projects/{id}`
- Xem chi tiết dự án: `GET /api/v1/projects/{slug}`
- Chọn media: `GET /api/v1/media`
- Tải media: `POST /api/v1/media/upload`

Frontend gọi qua `src/lib/api.ts`; nếu có token trong `localStorage.mh_token` thì tự gửi `Authorization: Bearer ...`.

## Nguyên nhân lỗi đã phát hiện

1. Gallery trong modal chọn nhiều đang merge ảnh mới vào `formGallery`, nên khi admin bỏ chọn trong modal thì ảnh cũ vẫn còn. Cảm giác thực tế là không rõ ảnh nào đang được chọn.
2. Tab “Không gian sống” trước đó chỉ hiển thị số lượng ảnh, chưa có danh sách thumbnail trực tiếp trong tab này.
3. `handleEditOpen` chỉ nhận array thật cho một số field. Nếu API hoặc DB trả JSON string, form có thể mở lại rỗng.
4. Checklist chỉ có trạng thái tổng quát, chưa có danh sách field thiếu và chưa click được để nhảy đúng tab.
5. Backend `Project` đã có phần lớn fillable/casts cần thiết cho gallery và các repeater chính; nhóm VR nâng cao không nằm trong bảng `projects`, đang thuộc module VR riêng.

## Bảng audit field trọng tâm

| Tab | Field | Payload gửi lên | Backend validate | Model fillable/casts | API trả lại | Edit map lại | Cách sửa |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Không gian sống | `gallery_label` | Có | Có | Có | Có | Có | Giữ input tiếng Việt, thêm checklist field thiếu. |
| Không gian sống | `gallery_title` | Có | Có | Có | Có | Có | Highlight khi thiếu và dùng trên client. |
| Không gian sống | `gallery_description` | Có | Có | Có | Có | Có | Highlight khi thiếu và dùng trên client. |
| Không gian sống | `gallery` | Có, luôn là `string[]` | Có | Có cast array | Có | Có, đã normalize array/JSON string | Sửa media modal chọn nhiều, không merge mù, thêm thumbnail preview/xóa/sắp xếp. |
| Hero | `quick_cards` | Có, array | Có | Có cast array | Có | Có, đã normalize | Checklist chỉ rõ thiếu thẻ thông tin nhanh. |
| Hero | `project_facts` | Có, array | Có | Có cast array | Có | Có, đã normalize | Checklist chỉ rõ thiếu thông tin tổng quan. |
| Vị trí | `connectivity` | Có, array | Có | Có cast array | Có | Có, đã normalize | Checklist nhảy về tab Vị trí. |
| Vị trí | `map_image_url` | Có | Có | Có | Có | Có | Media single picker có selected state. |
| Tiện ích | `amenity_details` | Có, array | Có | Có cast array | Có | Có, đã normalize | Media single picker dùng cho từng ảnh tiện ích. |
| Sản phẩm | `floor_tabs` | Có, array | Có | Có cast array | Có | Có, đã normalize | Checklist chỉ rõ thiếu nhóm loại sản phẩm. |
| Sản phẩm | `floor_plans` | Có, array | Có | Có cast array | Có | Có, đã normalize | Media single picker dùng cho ảnh mặt bằng. |
| Bảng giá | `price_rows` | Có, array | Có | Có cast array | Có | Có, đã normalize | Payload giữ dạng mảng dòng giá. |
| Bảng giá | `policy_cards` | Có, array | Có | Có cast array | Có | Có, đã normalize | Checklist nhảy đúng tab. |
| Tiến độ | `project_timeline` | Có, array | Có | Có cast array | Có | Có, đã normalize | Optional, không chặn publish. |
| Đầu tư | `investment_reasons` | Có, array | Có | Có cast array | Có | Có, đã normalize | Optional, không chặn publish. |
| Đầu tư | `project_testimonials` | Có, array | Có | Có cast array | Có | Có, đã normalize | Media single picker dùng cho avatar. |
| FAQ | `project_faqs` | Có, array | Có | Có cast array | Có | Có, đã normalize | Optional, không chặn publish. |
| SEO | `schema_price`, `schema_price_currency`, `schema_availability` | Có | Có | Có | Có | Có | Client chỉ render khi có dữ liệu thật. |
| VR 360 | `virtual_tour_url` | Có | Có | Có | Có | Có | Link đơn giản nằm ở `projects`. |
| VR 360 | `virtual_tour_embed`, `virtual_tour_thumbnail`, `is_virtual_tour_enabled` | Không gửi trong form dự án | Không thuộc controller này | Không có cột trong `projects` | Module VR riêng | Module VR riêng | Không thêm vào payload dự án để tránh lỗi cột không tồn tại. |

## Sửa đã áp dụng

- `MediaSelectModal` có chế độ chọn nhiều rõ ràng, viền/tick selected, “Bỏ chọn tất cả”, “Xác nhận chọn ảnh”.
- Khi chọn gallery, `formGallery` nhận đúng danh sách xác nhận cuối cùng từ modal.
- Tab “Không gian sống” hiển thị thumbnail preview ngay, có xóa ảnh, đưa lên, đưa xuống.
- `handleEditOpen` normalize array từ array thật hoặc JSON string.
- Checklist có field thiếu, click được, nhảy đúng tab và highlight field.
- Lỗi validation backend trả về được map về tab/field tương ứng.

## Còn cần kiểm thử thủ công trên server

- Dùng một dự án thật, chọn 3 ảnh gallery, lưu, mở lại edit và kiểm tra API detail.
- Kiểm tra public client chỉ hiển thị section “Không gian sống” khi `gallery` có ảnh.
- Kiểm tra module VR riêng nếu cần quản trị embed/thumbnail nâng cao.
