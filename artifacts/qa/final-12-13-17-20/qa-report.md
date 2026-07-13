# QA STT 12, 13, 17, 20

Ngày kiểm tra: 2026-07-13 (Asia/Saigon)

## STT 12 — Bảng trong bài viết

- Chrome: mở trình sửa bài, chèn bảng bằng modal riêng, tạo bảng 4 hàng × 2 cột, sửa ô thành `QA bảng ổn định`, lưu vào Quill rồi mở lại.
- Kết quả mở lại: 4 hàng, 8 ô, nội dung ô giữ nguyên; embed trong Quill là `contenteditable=false` nên sửa chữ ngoài bảng không thể làm mất cấu trúc bảng.
- Paste matcher giữ nguyên cấu trúc `table/thead/tbody/tr/th/td`, `rowspan`, `colspan` và loại bỏ script, style inline, event handler nguy hiểm.
- Backend regression: table round-trip giữ cấu trúc HTML.
- Ảnh: `stt12-table-modal-chrome.png`.

## STT 13 — Chọn nhiều đoạn

- Đã bỏ hoàn toàn nút và chế độ `Chọn nhiều đoạn` cũ.
- Ctrl/Cmd + kéo dùng trực tiếp trong editor; các vùng rời được lưu bằng Quill range và các nút format native của Quill áp dụng lên toàn bộ vùng đã lưu.
- Đã chặn hành vi drag-copy mặc định khi giữ Ctrl/Cmd và tính range từ tọa độ caret đầu/cuối.
- Chrome và Chromium: không còn nút cũ, toolbar native hiện đúng, TypeScript/lint pass.

## STT 17 — Vùng miền

- Migration local Docker chạy thành công: `2026_07_13_000006_enforce_project_regions_from_region_and_province`.
- Audit DB: 1 dự án Miền Bắc, 9 dự án Miền Nam, 0 region ngoài 4 giá trị chuẩn.
- API `/api/v1/projects/regions`: chỉ trả Miền Bắc (1) và Miền Nam (9).
- Form admin chỉ có: Chọn vùng miền, Miền Bắc, Miền Trung, Miền Nam, Quốc tế.
- Backend từ chối alias/city mới; migration chỉ dùng `region`, fallback `province`, không suy đoán từ tên/location.
- Ảnh: `stt17-region-field.png`.

## STT 20 — Sticky editor tools

- Custom tools và toàn bộ Quill toolbar nằm trong cùng sticky container.
- Chrome và Chromium: `position: sticky`, toolbar tồn tại ở cả editor Đoạn mở đầu và Nội dung chính.
- Responsive 375/768/1024/1440: không tràn ngang body; ở 375 px toolbar tự cuộn ngang trong phạm vi editor.
- Ảnh: `chrome-editor-sticky.png`, `stt20-sticky-editor-375.png`, `stt20-sticky-editor-768.png`, `stt20-sticky-editor-1024.png`, `stt20-sticky-editor-1440.png`.

## Automated checks

- Frontend lint: pass.
- TypeScript `npx tsc --noEmit`: pass.
- Production build: pass; cảnh báo cache API posts 26,569,013 bytes đã ghi nhận, không chặn.
- Backend: 15 tests pass, 165 assertions.
- Target regression: 6 tests pass, 92 assertions.
- `route:list --path=api/v1/projects`: 9 routes, `/projects/regions` đứng trước `/{slug}`.
- `git diff --check`: pass.
- PHP OCI/Firebird optional extension warnings: đã ghi nhận, không chặn.

## Browser coverage

- Google Chrome extension browser: pass cho editor, sticky tools và table modal.
- Codex in-app Chromium: pass cho editor, table round-trip, region form và responsive breakpoints.
- Edge binding không có trong môi trường QA hiện tại; không báo khống là đã chạy Edge.
