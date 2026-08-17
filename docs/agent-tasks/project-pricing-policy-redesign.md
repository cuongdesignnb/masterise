# Agent task — Làm lại section “Bảng giá & Chính sách bán hàng” và phần quản lý Admin

> **Repository:** `cuongdesignnb/masterise`  
> **Baseline bắt buộc:** `main@815e1f4966290bb1baf13be4b0879fe6b9149296`  
> **Mức ưu tiên:** High  
> **Phạm vi:** Frontend trang chi tiết dự án + Admin quản lý dự án + Rich Editor renderer + kiểm thử  
> **Thiết kế chuẩn:** ảnh mockup cuối cùng được đính kèm trong task này. Agent phải dùng ảnh đó làm visual reference chính và chụp ảnh nghiệm thu ở `1448 × 1086`.

---

## 1. Mục tiêu

Làm lại hoàn chỉnh section **“Bảng giá & Chính sách bán hàng”** theo thiết kế chuẩn, đồng thời đơn giản hóa phần quản trị theo đúng cách dữ liệu hiện tại đang được nhập:

- Toàn bộ heading, đoạn văn, bullet, callout, bảng giá, ảnh inline, caption và link tài liệu được biên tập trong Rich Editor `pricing_policy_description`.
- Không dựng bảng giá thành dashboard riêng.
- Không tạo filter, tab nhóm bảng giá, phân trang hoặc bảng dữ liệu giả.
- Cột phải chỉ là gallery ảnh bảng giá/chính sách nổi bật.
- Nội dung dài mặc định thu gọn nhưng **vẫn tồn tại đầy đủ trong DOM** để giữ SEO.
- Không làm mất dữ liệu cũ trong `price_rows`, `policy_cards`, `payment_policy`, `sales_policy`, `booking_policy`.
- Không thêm migration hoặc drop schema trong task này.

### Definition of Done

Không đánh dấu hoàn tất nếu chưa đạt đồng thời:

1. Frontend có đủ block, hierarchy, trạng thái và tương tác như ảnh chuẩn.
2. Admin chỉ còn workflow chính: **Rich Editor + gallery ảnh + dữ liệu giá hệ thống**.
3. Dữ liệu legacy được bảo toàn và có fallback/chuyển đổi rõ ràng.
4. Desktop, tablet, mobile không vỡ layout hoặc tạo horizontal overflow ở page level.
5. Lint, TypeScript, build, test hiện tại và test mới đều pass.
6. PR có screenshot desktop `1448 × 1086` và mobile khoảng `390 × 844` để đối chiếu.

---

## 2. Audit hệ thống hiện tại

### Frontend hiện tại

File chính:

- `src/components/project-detail/ProjectPricingPolicySection.tsx`

Component hiện tại tách `price_rows` thành:

- `rowItems`: bảng giá thủ công.
- `imageItems`: ảnh bảng giá.
- `fileItems`: PDF/Excel/Word/ảnh.
- `noteItems`: ghi chú.
- `project.policies`: policy card độc lập.

Sau đó component render nhiều card, bảng, file list, note card và policy card nên dữ liệu bị lặp và giao diện rườm rà. Cấu trúc này phải được thay thế.

### Rich Editor hiện tại

- `src/components/admin/RichTextEditor.tsx` đã hỗ trợ heading, link, ảnh có alt/caption và bảng HTML.
- `src/components/content/RichHtmlContent.tsx` đã sanitize HTML, normalize heading và bọc bảng bằng `.rich-html-table-wrap`.
- `src/app/globals.css` đã có style nền tảng cho rich content và bảng cuộn ngang.

Không xây editor hoặc table system mới. Chỉ mở rộng những thành phần trên.

### Admin hiện tại

File:

- `src/app/admin/du-an/page.tsx`

Tab `pricingPolicy` hiện có:

- Rich Editor mô tả chung.
- Giá dùng cho filter/thẻ dự án.
- Giá theo m².
- Repeater `Bảng giá & tài liệu giá` với 4 loại: row, image, file, note.
- Repeater `Chính sách bán hàng` với policy card.

UI Admin phải được đơn giản hóa theo mục 8.

### Backend hiện tại

Các trường cần thiết đã tồn tại:

- `pricing_policy_description`.
- `price_rows`.
- `policy_cards`.
- `updated_at`.
- `section_titles`.

**Không tạo migration mới và không drop cột.**

---

## 3. Data contract sau refactor

### 3.1. Nguồn dữ liệu chuẩn

| Vai trò | Nguồn |
|---|---|
| Nội dung bài viết, heading, bullet, bảng, callout, ảnh inline, caption, link tải file | `pricing_policy_description` |
| Gallery ảnh bên phải | item ảnh trong `price_rows`, fallback ảnh legacy từ `policy_cards` |
| Tiêu đề/eyebrow | `section_titles.pricingPolicy` |
| Badge cập nhật | `updated_at` |
| CTA | copy theo thiết kế, cuộn đến `#project-consult-form` |
| Giá dùng cho filter/sort/schema/project card | `price_min`, `price_max`, `price_per_sqm_*`, `price_text` — giữ nguyên nghiệp vụ |

### 3.2. Gallery item chuẩn

Tiếp tục dùng `price_rows` để tránh migration:

```ts
{
  kind: "image",
  title: string,       // alt + tên ảnh
  description: string, // caption
  image_url: string,
  button_label: "Phóng to"
}
```

Quy ước:

- Item ảnh đầu tiên là ảnh chính.
- Thứ tự array là thứ tự thumbnail.
- Client hiển thị tối đa 3 thumbnail trong card; lightbox truy cập toàn bộ ảnh.
- Deduplicate theo URL trước khi render.

### 3.3. Dữ liệu legacy

Legacy gồm:

- `price_rows.kind === "row"`.
- `price_rows.kind === "note"`.
- `price_rows.kind === "file"` không phải ảnh.
- `policy_cards`.

Yêu cầu bắt buộc:

- Không tự xóa legacy khi mở hoặc lưu dự án.
- Khi Admin chỉnh gallery, merge item ảnh mới với legacy item chưa chỉnh; không lọc mất chúng khỏi payload.
- Nếu `pricing_policy_description` rỗng nhưng legacy có dữ liệu, Client dựng **fallback rich HTML** từ legacy rồi render bằng layout mới; không quay lại UI cũ.
- Admin hiển thị cảnh báo `Dữ liệu cũ chưa được chuyển vào Rich Editor` và nút `Chuyển dữ liệu cũ vào Rich Editor`.
- Chuyển đổi phải idempotent, có preview/xác nhận và không tự xóa dữ liệu gốc.

Quy tắc chuyển đổi:

- `row` → bảng HTML.
- `note` → `blockquote`/callout.
- `policy_cards` → heading + paragraph + bullet + link file.
- file PDF/Excel/Word → file link trong Rich Editor.
- ảnh legacy trong policy card → thêm vào gallery nếu URL chưa tồn tại.

---

## 4. Frontend — layout bắt buộc

### 4.1. Container

- Dùng container hiện tại của trang chi tiết dự án.
- Nền section trắng/kem rất nhạt.
- Desktop dùng grid ngoài khoảng `65 / 35`.
- Tablet/mobile chuyển về một cột.
- Hai card chính cân đối như mockup, không có vùng trống vô nghĩa.

### 4.2. Header section

Hiển thị đúng thứ tự:

1. Eyebrow: `THÔNG TIN DỰ ÁN`.
2. Title: `Bảng giá & Chính sách bán hàng`.
3. Subtitle: `Thông tin giá bán, chính sách thanh toán, ưu đãi và tài liệu cập nhật của dự án.`
4. Badge bên phải: `Cập nhật gần nhất: dd/MM/yyyy`.

Yêu cầu kỹ thuật:

- Thêm `updatedAt?: string | null` vào `ProjectDetail`.
- Map từ `api.updated_at` trong `src/adapters/projectAdapter.ts`.
- Không hardcode `23/05/2024`; đây chỉ là fixture của mockup.
- Sửa normalize `section_titles` để không xóa `eyebrow`.
- Default `pricingPolicy`:

```ts
{
  eyebrow: "THÔNG TIN DỰ ÁN",
  title: "Bảng giá & Chính sách bán hàng"
}
```

- Loại bỏ nút CTA ở header của component cũ.

### 4.3. Card trái — Rich Editor

Card title:

- `Mô tả bảng giá & chính sách`.

Bên trong:

- Tự sinh mục lục `Nội dung chính` từ heading trong Rich Editor.
- Desktop: mục lục nằm bên trái nội dung giống mockup.
- Lấy tối đa 5 heading đầu tiên có text.
- Heading có `id` ổn định, không trùng.
- Click mục lục scroll đúng heading; dùng `scroll-margin-top`.
- Nếu dưới 2 heading thì ẩn mục lục và cho nội dung full width.
- Mobile: mục lục thành `<details>` gọn.

Rich content phải style đúng:

- H2/H3 rõ hierarchy.
- Paragraph line-height thoáng.
- `strong` nhấn vừa phải.
- `ul`, `ol`, checklist.
- `blockquote` trở thành callout beige có icon/info treatment.
- `figure`, `img`, `figcaption` đúng spacing/radius.
- Table rộng cuộn ngang.
- File link chuyên dụng render thành chip tài liệu.

### 4.4. Bảng trong Rich Editor

Không render bảng từ `rowItems` nữa.

Bảng HTML phải:

- Nằm trong `.rich-html-table-wrap`.
- Border mảnh, radius, nền trắng.
- Header beige nhạt.
- Zebra row rất nhẹ.
- Cell padding gọn.
- `min-width` theo số cột; bảng rộng tối thiểu khoảng `720px`.
- Có cue `Cuộn ngang để xem đầy đủ`.
- Cuộn mượt trên touch device.
- Mobile không làm nở viewport và không biến bảng thành card.
- Focus keyboard thấy outline.

### 4.5. File link trong Rich Editor

Bổ sung nút toolbar `Chèn tài liệu` trong `RichTextEditor`:

- Hỗ trợ PDF, Excel, Word và file thông thường.
- Chọn file từ Media Library.
- Nhập nhãn hiển thị.
- Có tùy chọn mở tab mới.
- HTML đầu ra dùng class ổn định:

```html
<a
  class="article-file-link"
  href="..."
  target="_blank"
  rel="noopener noreferrer"
  data-file-type="pdf"
>
  Bảng giá tham khảo PDF
</a>
```

Client render thành chip như mockup:

- icon file/PDF bên trái.
- label ở giữa.
- icon download ở phải.
- Không biến link thường thành file chip.

### 4.6. Thu gọn nội dung

Trạng thái mặc định:

- Nội dung render đầy đủ trong DOM.
- Wrapper có `max-height` + `overflow: hidden` khi chưa mở.
- Có gradient fade cuối vùng nội dung.
- Button: `Xem thêm nội dung`.
- Khi mở: bỏ max-height, đổi thành `Thu gọn nội dung`.
- Chỉ hiển thị button khi `scrollHeight` vượt ngưỡng.
- Dùng `ResizeObserver` để cập nhật sau khi ảnh/table load.
- Khi thu gọn, scroll nhẹ về đầu card nếu cần.
- Button có `aria-expanded` và `aria-controls`.

Không cắt chuỗi HTML và không conditionally unmount nội dung bị thu gọn.

### 4.7. Card phải — gallery ảnh

Card title:

- `Ảnh bảng giá & chính sách`.

Phải có:

- Một ảnh chính trong khung cố định, `object-contain`, không crop bảng giá.
- Hai button: `Phóng to`, `Xem tất cả ảnh`.
- Tối đa 3 thumbnail ở hàng dưới.
- Thumbnail active có viền gold.
- Caption ảnh active.
- Dòng cập nhật lấy từ `updatedAt`.
- Click thumbnail đổi ảnh chính.
- `Phóng to` và `Xem tất cả ảnh` mở lightbox tại ảnh active.

Lightbox:

- Escape đóng.
- Arrow Left/Right chuyển ảnh.
- Có nút trước/sau và số thứ tự.
- Click backdrop đóng.
- Lock body scroll.
- Focus management hợp lệ.
- Alt lấy từ title, không dùng alt chung chung nếu có title.

Fallback:

- 1 ảnh: không render thumbnail thừa.
- 2 ảnh: render 2 thumbnail.
- 0 ảnh: card trái full width, không render card gallery rỗng.
- URL trùng phải deduplicate.
- Ảnh lỗi không làm crash section.

### 4.8. CTA cuối section

Một banner full width bên dưới hai card:

- Title: `Nhận bảng giá & chính sách mới nhất`.
- Description: `Chuyên viên sẽ gửi tài liệu cập nhật theo loại căn và nhu cầu của bạn.`
- Primary: `Nhận bảng giá`.
- Secondary: `Đăng ký tư vấn`.

Cả hai button cuộn đến `#project-consult-form`.

Không thêm hotline, popup, form riêng hoặc CTA khác trong section.

---

## 5. Visual contract

Ưu tiên token hiện có; giá trị tham chiếu:

```css
--pricing-page: #fffdf9;
--pricing-card: #ffffff;
--pricing-border: #eadfce;
--pricing-beige: #fbf4e9;
--pricing-gold: #b88746;
--pricing-gold-dark: #9c692b;
--pricing-ink: #1f1b16;
--pricing-muted: #6f665c;
```

Hình học:

- Card radius khoảng `16px`.
- Button radius `8–10px`.
- Border `1px` beige nhẹ.
- Shadow mềm, opacity thấp.
- Không dùng navy background, glassmorphism hoặc dashboard cards dày đặc.

Viewport nghiệm thu:

- `1448 × 1086`, browser zoom `100%`.
- Không scrollbar ngang ở page level.
- Fixture nghiệm thu phải có heading, table rộng, callout, ảnh inline, file links và ít nhất 3 ảnh gallery.

“Khớp 100%” nghĩa là:

- Không thiếu block trong mockup.
- Không thêm block ngoài mockup.
- Đúng hierarchy, grid, spacing, radius, màu, button, collapse và gallery state.
- Text/copy mặc định đúng.
- Sai khác font rasterization nhỏ giữa OS được chấp nhận; sai khác layout thì không.

Agent phải đính kèm screenshot before/after hoặc side-by-side trong PR.

---

## 6. Responsive contract

### Desktop `>= 1024px`

- Header title và update badge nằm hai phía.
- Main content `65/35`.
- Mục lục nằm trái trong card Rich Editor.
- CTA nằm một hàng, button bên phải.

### Tablet `768–1023px`

- Main content một cột.
- Gallery nằm dưới Rich Editor.
- Mục lục thành `<details>` hoặc anchor row.
- Table vẫn cuộn ngang trong container.

### Mobile `< 768px`

- Padding giảm hợp lý.
- Title/badge không tràn.
- Mục lục collapsed.
- Thumbnail 3 cột hoặc horizontal scroll.
- CTA button stack full width.
- File chip stack dọc.
- Không overflow viewport.

---

## 7. Chức năng Client phải loại bỏ

Xóa khỏi UI mới trong `ProjectPricingPolicySection.tsx`:

- Header button `Nhận bảng giá` hiện tại.
- Bảng dựng từ `rowItems`.
- Mobile cards dựng từ `rowItems`.
- Note cards dựng từ `noteItems`.
- Card `Bảng giá & tài liệu giá` độc lập.
- Policy card list dựng từ `project.policies`.
- File list độc lập dựng từ `fileItems`.
- Label `Chính sách bảo hành` hardcode.
- Status/badge/card không tồn tại trong mockup.

Sau rewrite phải xóa dead code và import icon thừa.

---

## 8. Admin — thiết kế quản lý mới

Tab vẫn tên **“Bảng giá & Chính sách”**, chỉ gồm ba nhóm chính.

### 8.1. Nội dung Rich Editor

Card đầu tiên:

- Label: `Nội dung bảng giá & chính sách`.
- Helper: `Nhập toàn bộ heading, mô tả, bảng giá, chính sách, ảnh trong bài, caption và link tài liệu tại đây.`
- Dùng `RichTextEditor` với `stickyToolbar`.
- Toolbar có heading, bold/italic/list/alignment, link, ảnh + alt + caption, bảng và tài liệu/file.
- Note: `Bảng rộng sẽ tự cuộn ngang ngoài website.`

Không tạo field riêng để nhập heading, bullet, note hoặc bảng.

### 8.2. Gallery ảnh bảng giá & chính sách

Card thứ hai:

- Title: `Ảnh bảng giá & chính sách`.
- Helper: `Ảnh đầu tiên là ảnh chính. Dùng Lên/Xuống để đổi thứ tự.`
- Button: `Chọn nhiều ảnh`.
- Mỗi ảnh gồm:
  - preview.
  - title/alt bắt buộc trước khi publish.
  - caption tùy chọn.
  - Lên/Xuống.
  - Xóa.
- Không có badge, icon, CTA label hoặc file policy.
- Chỉ thao tác item ảnh trong `price_rows`; giữ nguyên legacy item khác.

### 8.3. Dữ liệu giá hệ thống

Gộp hai card hiện tại thành một `<details>` mặc định đóng:

- Title: `Dữ liệu giá hệ thống`.
- Helper: `Dùng cho bộ lọc, sắp xếp, thẻ dự án và structured data; không tự tạo nội dung trong Rich Editor.`
- Giữ nguyên field, đơn vị và conversion hiện tại.

### 8.4. Legacy notice

Nếu có row/note/file legacy hoặc policy card:

- Hiển thị warning card, không render repeater cũ.
- Hiển thị số lượng từng loại.
- `Xem dữ liệu cũ` mở read-only preview.
- `Chuyển dữ liệu cũ vào Rich Editor` thực hiện migration thủ công có confirm.
- Không có button xóa hàng loạt mặc định.

### 8.5. Loại bỏ khỏi Admin UI

Loại bỏ UI tạo mới:

- `Thêm dòng giá`.
- `Thêm file` trong repeater bảng giá.
- `Thêm ghi chú`.
- Repeater `Chính sách bán hàng`.
- Field badge/icon/CTA/file của policy card.

Không drop state/type/backend column nếu có nguy cơ mất legacy data.

---

## 9. RichTextEditor và Media Library

Mở rộng `MediaSelectModal` bằng filter context rõ ràng:

```ts
type MediaKind = "image" | "document" | "all";
```

- Nút chèn ảnh chỉ chọn image MIME.
- Nút chèn tài liệu không chọn image/video.
- Gallery Admin chỉ chọn image MIME.
- Không cho chọn PDF rồi render bằng `<img>`.

`RichHtmlContent` phải giữ các attribute an toàn cần thiết cho file link:

- `class="article-file-link"`.
- `data-file-type` theo allowlist.
- `target="_blank"`.
- `rel="noopener noreferrer"`.

Không nới sanitizer cho script, event handler, iframe hoặc style nguy hiểm.

---

## 10. Fallback và empty state

| Trường hợp | Kết quả |
|---|---|
| Không có rich HTML, có legacy | Dựng fallback HTML và render trong layout mới |
| Có rich HTML, có legacy | Rich HTML là canonical; legacy không render lặp |
| Có rich HTML, không gallery | Rich card full width |
| Chỉ có gallery, không content/legacy | Render gallery + CTA, không render card content rỗng |
| Không có content, gallery, legacy | Không render section |
| Gallery URL trùng | Deduplicate |
| Ảnh lỗi | Fallback nhẹ, không crash |

---

## 11. File dự kiến thay đổi

Bắt buộc kiểm tra/chỉnh tối thiểu:

- `src/components/project-detail/ProjectPricingPolicySection.tsx`
- `src/components/content/RichHtmlContent.tsx`
- `src/components/admin/RichTextEditor.tsx`
- `src/components/admin/MediaSelectModal.tsx`
- `src/app/admin/du-an/page.tsx`
- `src/app/globals.css`
- `src/types/project-detail.ts`
- `src/adapters/projectAdapter.ts`
- `src/types/api.ts` nếu cần type rõ hơn, không đổi API contract vô cớ
- `tests/projectPricingPolicySection.test.mjs` — thêm mới
- `package.json` — thêm script test

Có thể tách helper:

- `src/lib/projectPricingPolicy.ts`
- `src/components/project-detail/ProjectPricingPolicyGallery.tsx`
- `src/components/project-detail/ProjectRichContentToc.tsx`

---

## 12. Test bắt buộc

### 12.1. Static/unit contract

Thêm `tests/projectPricingPolicySection.test.mjs` kiểm tra tối thiểu:

- Component dùng `RichHtmlContent` làm nguồn bài viết.
- Có copy `Mô tả bảng giá & chính sách`.
- Có `Xem thêm nội dung` và `Thu gọn nội dung`.
- Có `Ảnh bảng giá & chính sách`.
- Có CTA mới với hai button.
- Không còn table markup từ `rowItems`.
- Không còn `.map()` policy card độc lập.
- Có `updatedAt` mapping.
- CSS có table scroll, file link, collapse gradient và active thumbnail.
- Admin không còn button tạo row/note/policy card mới.
- Admin vẫn có RichTextEditor và gallery image manager.

Thêm script:

```json
"test:project:pricing-policy": "node tests/projectPricingPolicySection.test.mjs"
```

### 12.2. Regression

Chạy:

```bash
npm run lint
npx tsc --noEmit
npm run build
npm run test:project:typography
npm run test:project:summary
npm run test:project:pricing-policy
npm run test:seo
npm run test:seo:schema
```

Nếu có chỉnh backend:

```bash
cd backend
php artisan test
vendor/bin/pint --test
```

### 12.3. Manual QA

Admin:

1. Mở dự án có dữ liệu cũ; warning legacy xuất hiện.
2. Lưu mà không migrate; legacy không bị mất.
3. Chèn heading, bảng 7 cột, callout, ảnh caption và PDF từ Rich Editor.
4. Chọn ít nhất 4 ảnh gallery, reorder và lưu.
5. Reload Admin; dữ liệu giữ đúng.
6. Preview/publish và kiểm tra Client.

Client:

1. Mục lục scroll đúng heading.
2. Bảng cuộn ngang; page không overflow.
3. Collapse/expand không xóa nội dung khỏi DOM.
4. Gallery đổi ảnh active.
5. Lightbox keyboard hoạt động.
6. File link mở/tải đúng.
7. Hai CTA cuộn đến form.
8. Refresh trực tiếp không có hydration warning.

---

## 13. Yêu cầu PR

PR phải có:

- Tóm tắt kiến trúc trước/sau.
- Danh sách chức năng đã loại bỏ.
- Cách bảo toàn legacy data.
- Screenshot desktop `1448 × 1086` đối chiếu ảnh chuẩn.
- Screenshot mobile khoảng `390 × 844`.
- Kết quả từng command test.
- Xác nhận không thêm migration/drop schema.
- Xác nhận không hardcode dữ liệu dự án mẫu vào production component.

Không merge nếu:

- Chưa có screenshot đối chiếu.
- Còn UI bảng giá/policy card cũ render song song.
- Admin lưu làm mất legacy data.
- Rich content bị cắt khỏi DOM khi collapse.
- Page có horizontal overflow.
- Lint/type/build/test fail.

---

## 14. Thứ tự triển khai khuyến nghị

1. Refactor derivation/fallback legacy thành helper có test.
2. Bổ sung `updatedAt` và sửa eyebrow normalization.
3. Nâng cấp `RichHtmlContent`: heading IDs/TOC data, table hint, file link.
4. Nâng cấp `RichTextEditor`: chèn document từ Media Library.
5. Rewrite Client section theo mockup.
6. Simplify Admin tab và giữ legacy data.
7. Hoàn thiện responsive/accessibility.
8. Viết test và chạy full regression.
9. Chụp screenshot, tinh chỉnh spacing đến khi khớp thiết kế.

---

## 15. Guardrails

- Không tạo seeder hoặc dữ liệu business giả cho production.
- Không drop `price_rows`, `policy_cards`, `payment_policy`, `sales_policy`, `booking_policy`.
- Không tự migrate/xóa dữ liệu khi chỉ mở Admin form.
- Không thay đổi bộ lọc giá hiện tại.
- Không làm ảnh hưởng section mặt bằng, tiện ích, bàn giao hoặc form lead.
- Không render raw HTML chưa sanitize.
- Không thêm package UI lớn nếu stack hiện tại đã đủ.
- Không thêm `any` nếu có thể khai báo type rõ.
- Không để console log debug trong production.
