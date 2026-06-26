# Project Admin Field Save Final Test

## Quy trình test chuẩn

1. Vào `/admin/du-an`.
2. Mở một dự án bất kỳ bằng nút sửa.
3. Nhập dữ liệu test vào từng nhóm trường bên dưới.
4. Bấm "Lưu thay đổi".
5. Không đóng modal, kiểm tra dữ liệu vừa được load lại sau save.
6. Đóng modal, mở lại dự án.
7. F5 trang admin, mở lại dự án lần nữa.
8. So sánh toàn bộ dữ liệu với giá trị đã nhập.

## Checklist trường cần xác nhận

| Nhóm | Trường đại diện | Kỳ vọng |
| --- | --- | --- |
| Thông tin chung | tên, slug, mã, trạng thái, published/hot/featured | Lưu và mở lại còn nguyên |
| Vị trí | khu vực, địa chỉ, tỉnh/quận/phường, lat/lng, mô tả vị trí | Lưu và F5 không mất |
| Giá & quy mô | giá min/max/text, diện tích, tổng căn, block, tầng | Số và text trả về đúng |
| Nội dung | mô tả ngắn, nội dung chi tiết, điểm nổi bật, địa điểm gần | Không mất dòng, không mất thứ tự |
| Ảnh | thumbnail, hero, gallery, brochure, video, VR, ảnh bản đồ | URL từ Media Library vẫn còn sau F5 |
| Không gian sống | nhãn, tiêu đề, mô tả, album ảnh | Client dùng lại đúng dữ liệu admin |
| Kết nối | icon, thời gian, nhãn | Repeater load lại đủ dòng |
| Tiện ích | tiêu đề, mô tả, ảnh, icon | Repeater load lại đủ dòng và ảnh |
| Mặt bằng | tab, tên mặt bằng, diện tích, tổng diện tích, ảnh | Repeater load lại đủ dòng |
| Bảng giá | loại hình, diện tích, giá | Bảng load lại đủ dòng |
| Chính sách | tiêu đề, mô tả, icon | Repeater load lại đủ dòng |
| Tiến độ | mốc thời gian, tiêu đề | Timeline load lại đủ mốc |
| Đầu tư | lý do đầu tư, testimonial, FAQ | Repeater load lại đủ dòng |
| SEO | title, description, keywords, schema price/currency/availability | SEO meta load lại đúng |

## Debug khi vẫn miss dữ liệu

Mở DevTools Console và bật log:

```js
localStorage.setItem('mh_project_save_debug', '1')
```

Sau đó lưu lại dự án và kiểm tra 3 log:

- `[PROJECT_SAVE_PAYLOAD]`: frontend đã gửi trường đó lên chưa.
- `[PROJECT_SAVE_RESPONSE]`: backend trả trường đó sau save chưa.
- `[PROJECT_FRESH_DETAIL_AFTER_SAVE]`: endpoint admin detail trả trường đó sau khi đọc lại DB chưa.

Nếu payload có nhưng response và fresh detail không có, lỗi nằm ở backend validation/fillable/cast/migration. Nếu response có nhưng F5 mất, kiểm tra endpoint `/api/v1/admin/projects/{id}` trên production và clear route/cache Laravel.

