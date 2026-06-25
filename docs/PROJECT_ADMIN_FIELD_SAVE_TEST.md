# Bảng test lưu dữ liệu Admin dự án

Tài liệu này dùng để kiểm tra thủ công theo đúng luồng: nhập dữ liệu trong Admin, lưu, đóng form, mở lại, xem API trả về và kiểm tra client nếu field có hiển thị public.

| Tab | Field | Có trong payload không? | Backend có lưu không? | API có trả không? | Edit form có map lại không? | Client có dùng không? | Trạng thái | Ghi chú |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Tổng quan | `name` | Có | Có | Có | Có | Có | Pass code | Bắt buộc khi lưu. |
| Tổng quan | `slug` | Có | Có | Có | Có | Có | Pass code | Tự sinh từ tên nếu trống. |
| Tổng quan | `code` | Có | Có | Có | Có | Không trực tiếp | Pass code | Dữ liệu quản trị. |
| Tổng quan | `category_ids` | Có | Có qua sync | Có qua relation | Có | Có | Pass code | Lưu bảng pivot. |
| Tổng quan | `description` | Có | Có | Có | Có | Có | Pass code | Checklist bắt buộc. |
| Tổng quan | `content` | Có | Có | Có | Có | Có | Pass code | Rich text. |
| Hero & Thông tin nhanh | `banner_image` | Có | Có | Có | Có | Có | Pass code | Chọn single media. |
| Hero & Thông tin nhanh | `thumbnail` | Có | Có | Có | Có | Có | Pass code | Chọn single media. |
| Hero & Thông tin nhanh | `badge_text` | Có | Có | Có | Có | Có | Pass code | Hiển thị nếu có. |
| Hero & Thông tin nhanh | `hero_subtitle` | Có | Có | Có | Có | Có | Pass code | Fallback từ description. |
| Hero & Thông tin nhanh | `video_url` | Có | Có | Có | Có | Có | Pass code | CTA video nếu có. |
| Hero & Thông tin nhanh | `quick_cards` | Có | Có | Có | Có | Có | Pass code | Normalize array khi mở lại. |
| Hero & Thông tin nhanh | `project_facts` | Có | Có | Có | Có | Có | Pass code | Normalize array khi mở lại. |
| Hero & Thông tin nhanh | `project_stats` | Có | Có | Có | Có | Có | Pass code | Normalize array khi mở lại. |
| Không gian sống | `gallery_label` | Có | Có | Có | Có | Có | Pass code | Checklist có field thiếu. |
| Không gian sống | `gallery_title` | Có | Có | Có | Có | Có | Pass code | Checklist có field thiếu. |
| Không gian sống | `gallery_description` | Có | Có | Có | Có | Có | Pass code | Checklist có field thiếu. |
| Không gian sống | `gallery` | Có | Có | Có | Có | Có | Pass code | Có thumbnail preview, xóa, sắp xếp. |
| Vị trí & Kết nối | `location` | Có | Có | Có | Có | Có | Pass code | Checklist bắt buộc. |
| Vị trí & Kết nối | `location_description` | Có | Có | Có | Có | Có | Pass code | Section bản đồ. |
| Vị trí & Kết nối | `address`, `ward`, `district`, `province` | Có | Có | Có | Có | Có | Pass code | Dữ liệu địa chỉ. |
| Vị trí & Kết nối | `lat`, `lng` | Có | Có | Có | Có | Không trực tiếp | Pass code | Lưu dạng number/null. |
| Vị trí & Kết nối | `map_image_url` | Có | Có | Có | Có | Có | Pass code | Chọn single media. |
| Vị trí & Kết nối | `connectivity` | Có | Có | Có | Có | Có | Pass code | Normalize array khi mở lại. |
| Vị trí & Kết nối | `nearby_places` | Có | Có | Có | Có | Fallback adapter | Pass code | Nhập dạng dòng, gửi array. |
| Tiện ích nổi bật | `amenity_details` | Có | Có | Có | Có | Có | Pass code | Chọn ảnh từng tiện ích qua media. |
| Sản phẩm & Mặt bằng | `floor_tabs` | Có | Có | Có | Có | Có | Pass code | Normalize array khi mở lại. |
| Sản phẩm & Mặt bằng | `floor_plans` | Có | Có | Có | Có | Có | Pass code | Chọn ảnh từng mặt bằng qua media. |
| Bảng giá & Chính sách | `price_rows` | Có | Có | Có | Có | Có | Pass code | Gửi mảng dòng `[loại, diện tích, giá]`. |
| Bảng giá & Chính sách | `policy_cards` | Có | Có | Có | Có | Có | Pass code | Normalize array khi mở lại. |
| Bảng giá & Chính sách | `payment_policy`, `sales_policy`, `booking_policy` | Có | Có | Có | Có | Có | Pass code | Adapter có fallback policy cards. |
| Tiến độ thi công | `project_timeline` | Có | Có | Có | Có | Có | Pass code | Optional. |
| Đầu tư & Đánh giá | `investment_reasons` | Có | Có | Có | Có | Có | Pass code | Optional. |
| Đầu tư & Đánh giá | `project_testimonials` | Có | Có | Có | Có | Có | Pass code | Avatar chọn qua media. |
| FAQ | `project_faqs` | Có | Có | Có | Có | Có | Pass code | Optional. |
| Ảnh, Video & Tài liệu | `brochure_url` | Có | Có | Có | Có | Có | Pass code | Có thể nhập URL hoặc chọn media. |
| Ảnh, Video & Tài liệu | `virtual_tour_url` | Có | Có | Có | Có | Có | Pass code | Link VR đơn giản. |
| SEO & Schema | `seo_title`, `seo_description`, `seo_keywords` | Có | Có qua seo meta | Có qua `seo_meta` | Có | Có | Pass code | Tạo/cập nhật SEO meta trong controller. |
| SEO & Schema | `schema_price`, `schema_price_currency`, `schema_availability` | Có | Có | Có | Có | Có | Pass code | JSON-LD chỉ dùng dữ liệu thật. |
| VR 360 | `virtual_tour_embed`, `virtual_tour_thumbnail`, `is_virtual_tour_enabled` | Không trong form dự án | Module riêng | Module riêng | Module riêng | Có qua component VR nếu module trả | Cần test module VR | Không thuộc bảng `projects`. |

## Test thủ công bắt buộc sau deploy

1. Mở dự án “Hanoi Seasons Garden”.
2. Vào tab “Không gian sống”.
3. Nhập nhãn, tiêu đề, mô tả section.
4. Bấm “Thêm ảnh”, chọn 3 ảnh, xác nhận.
5. Kiểm tra 3 thumbnail hiện trong danh sách.
6. Đổi thứ tự một ảnh bằng “Đưa lên” hoặc “Đưa xuống”.
7. Bấm “Lưu thay đổi”.
8. Mở lại form edit và kiểm tra dữ liệu còn nguyên.
9. Mở client chi tiết dự án và kiểm tra section “Không gian sống” hiển thị đúng thứ tự ảnh.
10. Xóa toàn bộ ảnh, bấm checklist “Không gian sống” và kiểm tra form nhảy đúng tab, báo thiếu “Danh sách ảnh không gian sống”.
