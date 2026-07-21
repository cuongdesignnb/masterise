# SEO & Schema Hardening — BA Review Report RC3

## Phạm vi và dấu vết Git

- Repository: `cuongdesignnb/masterise`
- Base branch: `main`
- Feature branch: `chore/seo-schema-hardening`
- Starting SHA: `ed75d58b6aa59f7a6aab75663e6030a0f3c513eb`
- Tested implementation SHA: `aae40a369c6f9dac62a5dfc742870084e1a0ad96`
- RC2 tag: `seo-schema-rc2-20260721-234700`
- Safety tag: `backup-seo-schema-before-codex-20260722-000555`
- RC3 head: commit chứa report này; đối chiếu bằng Draft PR và RC3 tag.

Không merge, không push `main`, không force-push, không deploy production và không chạy migration trên production trong lượt này.

## Kết quả đã kiểm chứng

### Frontend và SEO

- `npm ci`: pass, exit code 0.
- `npm run lint`: pass với 0 errors và 406 warnings hiện hữu.
- `npx tsc --noEmit`: pass, exit code 0.
- `npm run build`: pass trên Next.js 16.2.7.
- SEO smoke: 248 pass, 0 fail, 3 skip có giải thích.
- Asset validation: pass chữ ký file, định dạng decode, kích thước, độ biến thiên hình ảnh, HTTP 200 và MIME.
- Trình duyệt local xác nhận homepage và project detail có title, description, canonical, robots, đúng một H1 và JSON-LD parse được.
- Route admin chưa đăng nhập có `noindex,nofollow` và chuyển tới màn hình đăng nhập.

Ba fixture bị skip vì dữ liệu local không có, không tạo dữ liệu giả để ép test:

- project có review đã duyệt;
- job đang tuyển;
- job đã hết hạn.

Hành vi tương ứng được bao phủ bởi backend regression tests và feature flags mặc định tắt.

### Backend

- Composer install: pass.
- `migrate:fresh` trên SQLite testing cô lập: pass.
- Full backend suite: 191 tests pass, 892 assertions, 0 failure.
- Kiểm tra auth admin review: 401 khi chưa đăng nhập, 403 khi sai role và hợp lệ với role được phép.
- Review public scope, aggregate, contract, moderation transition, throttle và cache invalidation đều có regression test.

## Thay đổi kỹ thuật chính

### Reviews và API contract

- Tách `PublicProjectReviewResource` và `AdminProjectReviewResource`.
- Public response chỉ trả reviewer public fields và aggregate cùng published scope.
- Internal moderation/audit fields không xuất hiện trong public contract.
- State transition buộc `pending/rejected` không published; approved có thể published hoặc unpublished.
- Public submission mặc định tắt; khi bật có throttle, honeypot, minimum fill time, consent, challenge, sanitization, duplicate detection và pending moderation.
- Admin dashboard dùng authenticated API helper, có project selector, reject form và role-protected routes.
- Backend cache version và secured Next revalidation endpoint được gọi sau mutation.

### Feature flags

Tất cả mặc định `false`:

- `seo_site_entity_enabled`
- `seo_project_product_schema_enabled`
- `seo_project_review_schema_enabled`
- `seo_event_schema_enabled`
- `seo_job_schema_enabled`
- `public_project_review_submission_enabled`

Backend chỉ nhận boolean cho các key trên. Admin có switch và cảnh báo. Frontend đọc typed public settings trước khi emit schema/form.

### Metadata, schema và sitemap

- `buildMetadata` trả đúng `titleObj`; Open Graph và Twitter dùng cùng rendered title.
- CMS title hoàn chỉnh dùng absolute title; listing title không lặp brand.
- JSON-LD operator references chỉ phát khi operator context đã được xác minh và bật.
- Không còn ItemList fallback tự trỏ về listing.
- Event và JobPosting chỉ emit khi flag bật và dữ liệu eligibility thật đầy đủ.
- Không dùng ngày hiện tại, địa chỉ, salary, price hoặc organizer giả.
- Sitemap dùng timestamp thật hoặc bỏ field, loại query/private/expired route và có structured failure/threshold policy.
- Public page API được tách khỏi admin page API để không còn lỗi 401 trên dữ liệu public.

### Migration

Migration additive `2026_07_22_000000_add_seo_eligibility_fields.php` bổ sung:

- Event location/mode/status/organizer/online URL/offer fields cho posts.
- Job schema address/applicant country/salary unit/direct apply fields cho careers.

Migration không xóa hoặc đổi kiểu cột cũ. QA dùng SQLite testing cô lập, không dùng production DB.

### Assets

- Xóa hai generator placeholder.
- Thay logo/operator image, icon 192/512, app icon, Apple icon, favicon và OG image bằng hình có thiết kế thật, đúng encoding/kích thước.
- Thêm Twitter image động 1200×630.
- Asset hiện tại là artwork trung tính, không được gọi là logo Masterise chính thức.
- `seo_site_entity_enabled=false` cho tới khi owner phê duyệt brand asset và operator entity.

## CI

Workflow `.github/workflows/seo-schema-ci.yml` chạy trên pull request vào `main` và push feature branch:

- frontend install/lint/TypeScript/assets/build;
- Composer, SQLite testing migration, full backend tests;
- integration server và SEO smoke với fixture skip được khai báo rõ.

Trạng thái CI remote chỉ được kết luận sau khi push và Draft PR tạo xong. Không dùng kết quả local để giả nhận CI pass.

## Known limitations

- Local Node là 20.15.1 trong khi một dependency ESLint khuyến nghị Node 20.19+ hoặc 22.13+; `npm ci` vẫn exit 0. CI dùng Node 22.
- `npm ci` báo 5 dependency vulnerabilities (1 low, 2 moderate, 2 high); không tự chạy `npm audit fix --force` vì ngoài phạm vi và có nguy cơ breaking change.
- Lint còn 406 warnings ngoài phạm vi; không có lint error.
- Build có warning `z-index is currently not supported` từ ImageResponse, không làm build fail.
- Ba smoke fixtures nêu trên không có trong local DB và được skip minh bạch.
- Không có session admin được cấp cho browser QA, nên visual QA admin dừng ở trang đăng nhập; API permission tests đã pass.
- Neutral artwork vẫn pending brand approval; site entity/schema liên quan mặc định tắt.
- Google không được bảo đảm sẽ hiển thị favicon, ảnh, sao hoặc rich result dù output kỹ thuật hợp lệ.

## Rollback

Không rewrite history. Nếu RC3 cần thu hồi:

```bash
git switch chore/seo-schema-hardening
git revert <RC3-corrective-commit-sha>
git push origin chore/seo-schema-hardening
```

Safety tag để đối chiếu trạng thái trước Codex:

```text
backup-seo-schema-before-codex-20260722-000555
```

## Khuyến nghị production

Chưa deploy production. Chỉ xem xét deploy sau khi Draft PR có CI pass, code review được chấp thuận, BA duyệt bằng chứng, owner duyệt brand asset/operator identity và kế hoạch migration/rollback được xác nhận.
