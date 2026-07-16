# Báo cáo QA module Tuyển dụng

Ngày kiểm tra: 16/07/2026

## Phạm vi

- Public: `/tuyen-dung`, `/tuyen-dung/[slug]`, filter, danh sách, JobPosting schema, form ứng tuyển.
- Admin: `/admin/tuyen-dung`, `/admin/tuyen-dung/ung-vien`, trình soạn tin, Media Library, hồ sơ ứng viên và cài đặt repeater.
- Backend: API public/admin, private CV, permission, queue email, Unicode và migration sạch.

## Kết quả tự động

- ESLint: pass.
- TypeScript `tsc --noEmit`: pass.
- Next.js production build: pass, 46 trang được tạo; hai route tuyển dụng public là dynamic.
- Backend: 134 tests pass, 584 assertions.
- Riêng module tuyển dụng: 11 tests pass, 55 assertions.
- Tổng Laravel routes: 161; module tuyển dụng: 19 routes.
- `git diff --check`: pass.
- Kiểm tra mojibake trên toàn bộ file thay đổi: 0 marker.
- SMTP/queue: job gửi email HR và email xác nhận được assert đã dispatch; lỗi SMTP không rollback hồ sơ.

## Kết quả trình duyệt

- Desktop: danh sách và chi tiết hiển thị dữ liệu thật từ API, không có console error.
- Mobile breakpoint: không có horizontal overflow; filter thu gọn; card một cột; CTA ứng tuyển không che bottom navigation.
- Chi tiết: sticky panel desktop hoạt động; mobile có CTA cố định; JSON-LD `JobPosting` tồn tại.
- Form: modal mở đúng, đủ field, có file input PDF/DOC/DOCX và checkbox đồng ý chính sách.
- Admin: ba tab Tin tuyển dụng, Hồ sơ ứng viên, Cài đặt hoạt động; ảnh lấy từ Media Library; danh sách cấu hình dùng repeater, không nhập JSON.

## Ảnh QA

- `career-list-1440.png`
- `career-list-375.png`
- `career-detail-1440.png`
- `career-detail-375.png`
- `career-application-form.png`
- `admin-career-jobs.png`
- `admin-career-job-editor.png`
- `admin-career-applications.png`

## Ghi chú môi trường

- PHP local cảnh báo thiếu extension Oracle/Firebird (`oci8`, `pdo_oci`, `pdo_firebird`); không ảnh hưởng MySQL production hay kết quả test.
- Next.js cảnh báo payload API dự án/tin tức cũ vượt cache 2 MB; không phát sinh từ module tuyển dụng.
- Dữ liệu job và tài khoản QA đã được xóa khỏi database local sau khi chụp ảnh.
