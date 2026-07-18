# Báo cáo QA Task 29-32

Ngày kiểm tra: 18/07/2026

## Phạm vi

- Task 29: Bài viết liên quan trong Tổng quan dự án, tối đa 3 bài, đúng thứ tự.
- Task 30: Ẩn tag/chip tin tức trên toàn bộ giao diện public.
- Task 31: Card tiện ích dạng ngang trên mobile.
- Task 32: Mục lục mobile thu gọn mặc định, có cuộn nội bộ và nút Xem nhanh.

## Kiểm tra tự động

| Hạng mục | Kết quả |
| --- | --- |
| TypeScript `npx tsc --noEmit` | Đạt |
| ESLint `npm run lint -- --quiet` | Đạt |
| Next production build `npm run build` | Đạt, 46 trang |
| PHPUnit `php artisan test` | Đạt, 158 test / 767 assertion |
| Test chuyên biệt `ProjectRelatedPostsTest` | Đạt, 2 test / 36 assertion |
| Migration SQLite in-memory | Đạt, gồm migration `project_related_posts` |
| PHP syntax các tệp backend đã sửa | Đạt |
| Route audit | 162 route, 24 route dự án/tin tức liên quan |
| `git diff --check` | Đạt |
| Quét mojibake trong toàn bộ tệp đã sửa | Không phát hiện |

## QA giao diện

Đã kiểm tra tại 375, 768, 1024 và 1440 px.

- Không có overflow ngang: `scrollWidth === clientWidth` tại các viewport đã đo.
- Admin vẫn giữ nguyên tab Tổng quan và Rich Text Editor hiện có.
- Bộ chọn bài liên quan nằm ngay dưới editor, hiển thị 3/3, có đổi thứ tự và xóa.
- Public render sẵn 3 bài liên quan từ payload dự án, không phát sinh request riêng từ component.
- Dữ liệu thử có tag nhưng chuỗi tag không xuất hiện public.
- Mobile 375 px: TOC có `aria-expanded=false` khi tải lần đầu; panel mở có giới hạn chiều cao và cuộn nội bộ.
- Sau khi qua header, nút Xem nhanh xuất hiện; heading thứ 4 được đánh dấu đang đọc bằng IntersectionObserver.
- Card tiện ích mobile dùng ảnh bên trái khoảng 38%, nội dung bên phải; card thiếu ảnh vẫn giữ bố cục gọn.
- Tablet và desktop giữ grid tiện ích hiện tại.

Lưu ý: môi trường QA không có quyền tải ảnh Unsplash từ Internet, nên một số thumbnail fixture hiện placeholder; kích thước, tỉ lệ và bố cục ảnh vẫn được kiểm tra đầy đủ.

## Ảnh bằng chứng

- [Editor Tổng quan](./admin-project-overview-content-editor.png)
- [Bài viết liên quan ngay dưới editor](./admin-project-related-posts-under-editor.png)
- [Bài viết liên quan ngoài trang dự án](./project-related-posts-public.png)
- [Tin tức không hiển thị tag](./news-tags-hidden.png)
- [Tiện ích dự án trên mobile](./project-amenities-mobile.png)
- [TOC mobile mặc định thu gọn](./news-toc-mobile-collapsed.png)
- [TOC mobile mở rộng](./news-toc-mobile-expanded.png)
- [TOC mobile Xem nhanh và heading đang đọc](./news-toc-mobile-quick-view.png)

## Tài nguyên môi trường

- Không sử dụng Docker.
- Mock API và Next dev server chỉ được bật trong thời gian chụp QA.
- Đã tắt toàn bộ listener QA trên cổng 8750 và 8751 sau khi kiểm tra.
