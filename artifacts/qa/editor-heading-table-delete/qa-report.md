# QA hotfix editor heading và xóa bảng

Ngày kiểm tra: 2026-07-13 (Asia/Saigon)

## Heading

- Cả `Đoạn mở đầu` và `Nội dung chính` có native select: Đoạn thường, Heading 1–5.
- Picker Heading mặc định của Quill đã được loại bỏ nên không còn bị parent `overflow-x: auto` cắt menu.
- Selection gần nhất được lưu qua `selection-change`; Heading dùng `formatLine`.
- Đoạn mở đầu: đổi từ `P` sang `H2`, sau đó đổi lại `P` thành công.
- Nội dung chính: đổi từ `P` sang `H3` thành công.
- Multi-range vẫn dùng các Quill ranges đã lưu; Heading, Bold, Italic áp dụng trong `try/finally` để không bị `text-change` xóa ranges giữa chừng.
- Mobile 375 px: body không tràn ngang, hai toolbar vẫn `position: sticky`, native select rộng 138 px.
- Chrome: có 2 native Heading select, không còn picker `Normal`, console không có error.
- In-app Chromium: thao tác Heading, sticky và responsive pass.
- Edge: môi trường QA không cung cấp binding Edge riêng; không báo khống đã chạy.

## Xóa bảng

- Mode chèn mới không hiển thị nút `Xóa bảng`.
- Mode chỉnh sửa hiển thị nút đỏ `Xóa bảng`.
- Khi xóa có confirm: `Bạn có chắc chắn muốn xóa toàn bộ bảng này khỏi bài viết?`.
- Table embed được xóa bằng `quill.deleteText(tableIndex, 1, 'user')` để hỗ trợ undo.
- QA thực tế: table giảm từ 1 xuống 0; đoạn văn chính trước/sau bảng vẫn giữ nguyên.
- Delete/Backspace khi focus table mở modal chỉnh sửa rõ ràng, không xóa nhầm paragraph liền kề.

## Automated checks

- Frontend lint: pass.
- TypeScript: pass.
- Production build: pass.
- Backend: 15 tests pass, 165 assertions.
- `route:list`: pass, 131 routes.
- `git diff --check`: pass.
- Console Quill errors: 0.
- Cảnh báo cache API posts 26,569,013 bytes và PHP OCI/Firebird tùy chọn không chặn task.
