# QA bảng rich content trong Tổng quan dự án

Fixture local: `Masteri Grand Coast` tại `/du-an/masteri-grand-cost`.

## Luồng dữ liệu

- `projects.content` giữ HTML bảng.
- API detail trả nguyên `content`; list resource không trả field này.
- Adapter truyền `api.content` sang `ProjectDetail` không chuyển thành text/key-value.
- Lỗi hiển thị ban đầu là CSS public thiếu style bảng, đồng thời section bị max-height và gradient che.

## Kết quả DOM và responsive

| Viewport | Body tràn ngang | Bảng 2 cột | Bảng 5 cột | Nút xem thêm/thu gọn |
|---:|---|---|---|---:|
| 375 | Không | 294/294 px | wrapper 294 px, nội dung 720 px, scroll auto | 0 |
| 768 | Không | 655/655 px | wrapper 655 px, nội dung 720 px, scroll auto | 0 |
| 1024 | Không | vừa khung | vừa khung | 0 |
| 1440 | Không | vừa khung | vừa khung | 0 |

- 2 bảng, 10 hàng, 24 ô được render.
- `strong`, `em`, `rowspan`, `colspan`, `scope`, caption và cấu trúc thead/tbody được giữ.
- Border ô hiển thị; header có nền ivory/champagne và padding riêng.
- `#tong-quan` có `max-height: none`; không còn gradient che.
- Nội dung sau bảng hiện đầy đủ.
- Console không có error hoặc hydration mismatch ở 375 và 1440.

## Sanitizer

Backend cho phép các tag bảng an toàn gồm caption, colgroup, col, thead, tbody, tfoot, tr, th và td. Chỉ giữ thuộc tính cấu trúc an toàn; loại `style`, event handler, `javascript:` và element nguy hiểm.

## Ảnh QA

- `public-overview-expanded-375.png`
- `public-overview-expanded-1440.png`
- `public-overview-table-scroll.png`
- `public-overview-no-view-more.png`

Ảnh admin editor: `BLOCKED` do phiên QA browser không có phiên đăng nhập admin. Cấu trúc HTML editor được kiểm chứng bằng fixture và unit test sanitizer.
