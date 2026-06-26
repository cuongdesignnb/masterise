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

## Kết quả kiểm chứng thực tế bằng automated backend test

Ngày kiểm chứng: 2026-06-26.

Lệnh đã chạy trong thư mục `backend`:

```bash
php artisan test --filter=AdminProjectSaveProofTest
```

Kết quả:

```txt
PASS  Tests\Feature\AdminProjectSaveProofTest
✓ admin project save returns and reloads fresh detail fields
Tests: 1 passed (25 assertions)
```

Bằng chứng từ test `backend/tests/Feature/AdminProjectSaveProofTest.php`:

| Field | PUT payload | PUT response | GET admin detail | DB | Kết luận |
| --- | --- | --- | --- | --- | --- |
| `gallery_title` | Có: `Test lưu dữ liệu lúc phpunit` | Có | Có | Có | Backend/API lưu và đọc lại đúng |
| `gallery` | Có 2 URL | Có | Có | Được cast JSON | Backend/API lưu và đọc lại đúng |
| `quick_cards` | Có | Có | Có | Được cast JSON | Backend/API lưu và đọc lại đúng |
| `project_facts` | Có | Không assert ở PUT response | Có | Được cast JSON | Admin detail đọc lại đúng |
| `project_stats` | Có | Có | Có | Được cast JSON | Backend/API lưu và đọc lại đúng |
| `connectivity` | Có | Không assert ở PUT response | Có | Được cast JSON | Admin detail đọc lại đúng |
| `amenity_details` | Có | Không assert ở PUT response | Có | Được cast JSON | Admin detail đọc lại đúng |
| `floor_tabs` | Có | Không assert ở PUT response | Có | Được cast JSON | Admin detail đọc lại đúng |
| `floor_plans` | Có | Không assert ở PUT response | Có | Được cast JSON | Admin detail đọc lại đúng |
| `price_rows` | Có | Không assert ở PUT response | Có | Được cast JSON | Admin detail đọc lại đúng |
| `policy_cards` | Có | Không assert ở PUT response | Có | Được cast JSON | Admin detail đọc lại đúng |
| `project_timeline` | Có | Không assert ở PUT response | Có | Được cast JSON | Admin detail đọc lại đúng |
| `investment_reasons` | Có | Không assert ở PUT response | Có | Được cast JSON | Admin detail đọc lại đúng |
| `project_testimonials` | Có | Không assert ở PUT response | Có | Được cast JSON | Admin detail đọc lại đúng |
| `project_faqs` | Có | Không assert ở PUT response | Có | Được cast JSON | Admin detail đọc lại đúng |
| `schema_price` | Có: `8.9` | Có | Có | Có | Backend/API lưu và đọc lại đúng |
| `schema_price_currency` | Có: `VND` | Không assert ở PUT response | Có | Có | Backend/API lưu và đọc lại đúng |
| `schema_availability` | Có: `InStock` | Không assert ở PUT response | Có | Có | Backend/API lưu và đọc lại đúng |

Phần automated test đã chứng minh chuỗi backend/API:

```txt
Payload có dữ liệu
→ PUT /api/v1/projects/{id} response có dữ liệu
→ GET /api/v1/admin/projects/{id} có dữ liệu fresh
→ DB có dữ liệu đã lưu
```

Phần còn cần kiểm chứng trên production bằng trình duyệt thật sau deploy:

| Hạng mục | Trạng thái | Cách kiểm chứng |
| --- | --- | --- |
| F5 admin rồi mở lại form vẫn còn field | Cần chạy trên production sau deploy | Bật `mh_project_save_debug`, sửa `gallery_title`, lưu, F5, mở lại dự án |
| Client chi tiết dự án hiển thị dữ liệu mới | Cần chạy trên production sau deploy | Mở `/du-an/{slug}` sau khi GET admin detail đã có dữ liệu mới |
| Production route admin hết 404 | Cần chạy trên production sau deploy/cache clear | Network phải có `GET /api/v1/admin/projects` và `GET /api/v1/admin/projects/{id}` |

Nếu production vẫn miss sau khi automated backend test đã pass, lỗi sẽ nằm ở deploy/cache/runtime production, không còn nằm ở controller/model/migration local:

```bash
php artisan optimize:clear
php artisan route:clear
php artisan config:clear
php artisan cache:clear
php artisan migrate --force
```

