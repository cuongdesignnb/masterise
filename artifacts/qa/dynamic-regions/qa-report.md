# Báo cáo QA: Quản lý vùng miền linh động

Ngày kiểm tra: 2026-07-13

## Phạm vi đã kiểm tra

- CRUD vùng miền tại `/admin/locations`, gồm tìm kiếm, thứ tự, trạng thái và bảo vệ xóa khi đang được sử dụng.
- Gán vùng miền bắt buộc cho vị trí địa lý; lọc và hiển thị vùng miền trong danh sách vị trí.
- Chọn vị trí khi tạo/sửa dự án và tự động suy ra vùng miền ở chế độ chỉ đọc.
- Bộ lọc vùng miền động tại `/du-an` dùng slug và chỉ đếm dự án đã xuất bản có quan hệ vị trí/vùng miền hợp lệ.
- Backfill dữ liệu cũ, đồng bộ trường legacy `projects.region` và ghi log các bản ghi chưa thể ánh xạ.
- Responsive trang quản trị vị trí/vùng miền trên viewport điện thoại.

## Kết quả UI

- Ban đầu hiển thị đủ 4 vùng miền mặc định.
- Tạo, sửa, bật/tắt và sắp xếp vùng miền hoạt động đúng.
- Vùng miền mới xuất hiện ngay trong form vị trí.
- Danh sách vị trí hiển thị đúng cột vùng miền và số dự án.
- Form dự án hiển thị lựa chọn theo định dạng `Vị trí — Tỉnh/Thành — Vùng miền`; vùng miền được suy ra tự động, không nhập tay.
- Bộ lọc public sinh URL slug đúng: `/du-an?region=vung-qa-linh-dong` và chỉ trả dự án thuộc vùng được chọn.
- Không có lỗi console trong các luồng admin và public đã kiểm tra.
- Mobile: viewport thực tế 417 px, `documentElement.scrollWidth = clientWidth = 417`; không có tràn ngang.

## Dữ liệu QA tạm

Đã tạo một vùng miền, một vị trí và tạm gán dự án số 1 để kiểm tra đầy đủ luồng. Sau QA đã khôi phục dự án và xóa toàn bộ dữ liệu tạm. Trạng thái cuối:

- Vùng miền: 4 bản ghi mặc định.
- Vị trí: 0 bản ghi.
- Dự án số 1: `location_id = null`, `region = Miền Nam` như trước QA.

## Migration/backfill trên dữ liệu local

- 3 migration mới chạy thành công trong container PHP.
- Dữ liệu local có 0 vị trí nên không có xung đột hoặc vị trí chưa ánh xạ.
- Có 10 dự án legacy chưa có vị trí; migration không tự tạo vị trí và đã ghi log đúng yêu cầu.

## Kiểm tra tự động

- Frontend lint: pass.
- TypeScript (`tsc --noEmit`): pass.
- Production build: pass.
- Backend full test suite: 33 tests pass, 210 assertions.
- Dynamic regions regression: 18 tests pass, 47 assertions.
- `php artisan route:list`: pass, 136 routes.
- `git diff --check`: pass.

## Cảnh báo không chặn

- Next.js cảnh báo payload cache API posts khoảng 26.57 MB, vượt ngưỡng 2 MB.
- PHP thiếu extension OCI/Firebird tùy chọn; dự án không sử dụng các database này.

## Ảnh bằng chứng

- `regions-admin-list.png`
- `region-create.png`
- `region-edit.png`
- `location-region-select.png`
- `location-list-region-column.png`

Chrome xác nhận layout mobile bằng số đo DOM nhưng thao tác lưu ảnh mobile bị timeout ở lệnh chụp màn hình; kết quả responsive vẫn được ghi nhận ở trên.
