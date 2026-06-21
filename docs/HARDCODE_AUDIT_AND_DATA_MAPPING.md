# Hardcode Audit And Data Mapping

Ngay audit: 2026-06-21

## Tom tat

Audit tap trung vao cac route public va module admin/API lien quan. Pham vi da xu ly trong commit nay uu tien theo prompt: go mock khoi trang chi tiet du an, bo sung truong backend/admin de nhap du lieu that, va chuyen schema/metadata sang API.

## Bang mapping

| File | Hardcode / mock phat hien | Nguon dung | Admin hien co | Can bo sung | Trang thai |
| --- | --- | --- | --- | --- | --- |
| `src/data/projectDetailSeed.ts` | Seed project detail cho THE GLOBAL CITY, stats, gallery, amenities, floor plans, price rows, timeline, testimonials, FAQs | Backend `projects` detail fields qua `GET /api/v1/projects/{slug}` | Chua day du truoc khi sua | Them field detail vao `projects`, Model, API, Admin JSON tabs | Done: public route khong import nua |
| `src/adapters/projectAdapter.ts` | Import `defaultSeed`, Unsplash image fallback, stats so gia, amenities catalog, policies, FAQs, timeline, investment reasons, floor plans/price rows tu field suy dien | API project fields va cac JSON detail fields | Chua day du truoc khi sua | `quick_cards`, `project_facts`, `project_stats`, `connectivity`, `amenity_details`, `floor_tabs`, `floor_plans`, `price_rows`, `policy_cards`, `project_timeline`, `investment_reasons`, `project_testimonials`, `project_faqs`, schema fields | Done |
| `src/components/project-detail/ProjectDetailClient.tsx` | Default project seed prop, render section rong, CTA background Unsplash | Prop `project` tu server/API | Khong ap dung | Hide section khi mang rong; dung `video_url` that | Done |
| `src/app/du-an/[slug]/page.tsx` | Metadata/OG image fallback Unsplash, schema price `8900000000`, availability hardcode, project id fallback `1` | `seo_meta`, `schema_price`, `schema_price_currency`, `schema_availability`, project id API | SEO meta da co | Schema fields moi | Done |
| `backend/database/migrations/**projects**` | Thieu field chi tiet public | DB `projects` | Chua | Migration moi `add_detail_content_fields_to_projects_table` | Done |
| `backend/app/Models/Project.php` | Thieu fillable/casts cho field chi tiet | DB/API | Chua | Fillable/casts array/json | Done |
| `backend/app/Http/Controllers/Api/ProjectController.php` | Store/update khong validate/luu field chi tiet | API project | Chua | Validation va payload moi | Done |
| `src/app/admin/du-an/page.tsx` | Admin khong co cho nhap cac section detail/floor/price/timeline/FAQ/schema | Admin project form | Mot phan co san | Them tab `Chi tiet hien thi` va `Bang gia & Tien do` voi JSON textarea, validate JSON, nut dung mau cau truc | Done |
| `src/components/home/HomePageClient.tsx` | `fallbackHero`, fallback image, text doi tac/khach hang | Hero banners/settings/projects/posts/partners/testimonials/faqs API | Da co mot so module admin rieng | Can audit va go fallback home rieng | Pending |
| `src/data/seed.ts`, `src/data/projectsSeed.ts`, `src/data/newsSeed.ts`, `src/data/newsDetailSeed.ts`, `src/data/contactSeed.ts`, `src/data/aboutSeed.ts` | Du lieu public mau cho home/about/news/contact/project | Backend seeders/settings/posts/projects/leads | Mot phan da co | Can xoa import public hoac chuyen thanh dev example, thay bang API/settings | Pending |
| `src/components/contact/SupportDepartments.tsx` | fallback departments | Settings/contact departments API | Chua xac nhan | Can module settings/contact hoac an khi rong | Pending |
| `src/components/lead/GlobalContactForm.tsx` va form lead lien quan | Can xac minh dropdown project/API va UTM | `POST /api/v1/leads`, `GET /api/v1/projects` | Leads da co | Neu con option hardcode thi thay API | Pending |
| `src/app/tin-tuc/**`, `src/app/dau-tu/**` | Can xac minh seed/import fake posts | Posts API `post_type=news/investment/event` | Admin posts da co | Clear seed va related hardcode neu con | Pending |

## Acceptance da dat trong dot nay

- Trang `/du-an/[slug]` khong con import `src/data/projectDetailSeed`.
- Adapter project detail khong con dung default seed, Unsplash, stats/price/floor/FAQ/timeline/testimonial gia.
- Section rong trong project detail duoc an theo du lieu API.
- Schema project detail khong con price hardcode.
- Metadata project detail lay tu `seo_meta` neu API co.
- Backend co migration/model/controller cho cac truong chi tiet du an.
- Admin du an co tab nhap du lieu chi tiet va bang gia/tien do bang JSON textarea co validate.

## Con lai / can lam dot tiep theo

- Home/news/investment/contact/about con can audit sau hon de go het seed public ngoai project detail.
- `src/data/**` con nhieu file seed, can xac minh import public tung route truoc khi xoa.
- `npm run lint` toan repo hien fail do ESLint quet `backend/vendor` va nhieu loi co san ngoai pham vi.
