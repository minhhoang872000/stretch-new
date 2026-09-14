# Instructor Admin — Stretch Academy

Bảng quản lý giảng dạy: chương trình, video, lịch, học viên, chứng nhận, đánh giá và phân tích học tập.

Vue 3 + TypeScript + Tailwind CSS 4 + Vite. Không dùng component library — mọi thành phần UI nằm trong `src/components/ui`.

```bash
npm install
npm run dev        # http://localhost:5180
npm run build      # vue-tsc --noEmit && vite build
```

Đăng nhập demo: `instructor@stretch.vn` / `123456` — chỉ mở các màn hình chạy mock.
Muốn dùng màn hình **Video** (upload lên R2) thì đăng nhập bằng `ADMIN_EMAIL` / `ADMIN_PASSWORD` của `lead-tracker-api`.

---

## Upload video lên Cloudflare R2

Màn hình `/media` là phần **đã nối backend thật**. File đi thẳng từ trình duyệt lên R2 bằng presigned URL — không qua API, nên dung lượng không bị giới hạn bởi request body hay timeout của Render.

```
console ──POST /videos/uploads──▶ API ──▶ R2: mở multipart, ký từng part
console ──PUT part 1..N────────────────▶ R2        (3 part song song, tự retry)
console ──POST /videos/uploads/:id/complete──▶ API ──▶ R2: ghép part, ghi DB
```

Nếu R2 từ chối presigned `UploadPart` hoặc bucket không expose `ETag`, client tự chuyển sang **một PUT duy nhất** (`/videos/uploads/simple` → `/confirm`). Xem thử dùng đúng signed URL mà trang học nhận được, hết hạn theo `R2_VIDEO_PLAYBACK_TTL`.

### Cần cấu hình

1. **`instructor-admin/.env`** (copy từ `.env.example`):
   ```
   VITE_API_BASE_URL=http://localhost:3001/api/v1
   ```
2. **`lead-tracker-api/.env`**: các biến `R2_*` và `R2_VIDEO_*`. Bucket video phải **private** — playback là signed URL, bucket public làm chữ ký thành vô nghĩa. Thêm `http://localhost:5180` vào `CORS_ORIGINS`.
3. **CORS policy của bucket R2** — policy nằm ở `lead-tracker-api/r2-video-cors.json`:
   ```bash
   npx wrangler r2 bucket cors set <bucket> --file r2-video-cors.json
   npx wrangler r2 bucket cors list <bucket>     # kiểm tra lại
   ```
   Hoặc dán tay: R2 → bucket → Settings → CORS Policy → Add CORS policy → tab JSON.

   Thiếu `ExposeHeaders: ["ETag"]` là multipart hỏng: trình duyệt không đọc được ETag của từng part nên `CompleteMultipartUpload` từ chối danh sách part. Khi deploy nhớ thêm origin thật vào `AllowedOrigins`.

### Video được gắn vào bài học thế nào

Bằng `programSlug` + `lessonOrdinal`, trong đó **ordinal chỉ đếm bài dạng video, theo thứ tự phần, bắt đầu từ 0** — đúng quy ước `site/components/learning/LearnStage.vue` dùng khi hỏi `/api/lessons/video`. Đổi một bên là bài học phát nhầm file.

> Danh sách khóa/bài trong select vẫn lấy từ mock (`services/api.ts`), nên slug phải khớp slug thật bên site thì trang học mới tìm thấy video.

---

## Trạng thái: UI đầy đủ, dữ liệu còn lại là mock

Toàn bộ 8 nhóm chức năng đã dựng và chạy được. Trừ màn hình Video ở trên, phần còn lại đọc/ghi vào `src/mock/data.ts`. Ranh giới dữ liệu nằm ở hai file: `src/services/api.ts` (mock) và `src/services/http.ts` (API thật — bearer token, unwrap `{ success, data }`). Mỗi hàm trong đó ghi sẵn endpoint tương ứng cần gọi, ví dụ:

```ts
/** GET /api/courses */
async listCourses(): Promise<Course[]> { … }

/** POST /api/enrolments — cấp quyền tay sau khi khách chuyển khoản */
async grantAccess(learnerId: string, courseId: string) { … }
```

Đổi sang backend thật = sửa file đó, không view nào phải sửa theo.

## Các trang

| Route | Nội dung |
|---|---|
| `/dashboard` | Học viên đang học · đăng ký mới trong tuần · tiến độ TB mỗi khóa · buổi sắp tới · **bài bị bỏ giữa nhiều nhất** |
| `/courses` | Danh sách khóa (nháp / đã xuất bản), lọc + tìm không dấu |
| `/courses/:id` | 5 tab: Thông tin · **Nội dung (syllabus builder)** · Video · Kiểm tra · FAQ |
| `/media` | **Upload thật lên R2** (multipart, tiến độ, huỷ được), đo bitrate ngay trên máy, **cảnh báo file quá nặng**, xem thử bằng signed URL |
| `/sessions` | Tạo buổi workshop/lớp trực tuyến, số chỗ, **điểm danh**, xuất CSV |
| `/learners` | Danh sách học viên, tiến độ, **cấp quyền tay** |
| `/learners/:id` | Khóa đã đăng ký · tiến độ từng bài · ghi chú nội bộ · cấp/thu hồi quyền |
| `/certificates` | Cấp, tra cứu theo mã, thu hồi (giữ lại bản ghi) |
| `/reviews` | Duyệt / ẩn đánh giá trước khi hiện lên trang khóa học |
| `/analytics` | Bỏ giữa theo bài · câu quiz sai nhiều nhất · phần trăm xem được mỗi bài |

## Những chỗ chạy thật, không phải mockup

- **Upload R2**: chạy thật — presigned multipart, 3 part song song, tự retry lỗi mạng, huỷ giữa chừng thì abort luôn multipart bên R2 (part bỏ dở vẫn tính tiền cho tới khi R2 tự dọn sau 7 ngày).
- **Đo video**: `MediaView` đọc thời lượng, kích cỡ và bitrate của đúng file bạn chọn (qua `<video>` + `canvas`), và chụp một frame ~10% làm ảnh xem trước tại chỗ (chưa lưu poster lên bucket). Cảnh báo bitrate > 4 Mbps là bắt từ file thật; thời lượng đo được ghi vào DB sau khi upload xong.
- **Xuất CSV điểm danh**: tạo blob và tải về được, mở trực tiếp bằng Excel (có BOM cho tiếng Việt).
- **Syllabus builder**: kéo thả để đổi thứ tự bài, kèm nút lên/xuống — WCAG 2.2 yêu cầu mọi thao tác kéo phải có cách thay thế bằng một lần bấm.
- **Báo cáo bỏ giữa**: tính từ bản ghi xem theo từng bài (`lesson_progress`), không phải số bịa. Hàm `computeDropOff` trong `services/api.ts` chính là hình dạng câu SQL sau này.

## Hệ thiết kế — và vì sao chọn như vậy

Dựng theo 2 skill được chỉ định, nhưng không áp dụng mù:

**`ui-ux-pro-max`** (`--design-system` cho "learning management admin dashboard") trả về: style `Flat Design`, typography `Fira Sans / Fira Code`, hiệu ứng "no gradients/shadows, transition 150–200ms", và checklist trước khi giao. Đã lấy toàn bộ phần này.

**Không** lấy bảng màu teal-mint mà skill đề xuất cho phần chrome: admin này quản lý Stretch, nên nó dùng **navy #0B2A4A + cam #F47A1F của chính brand** để trông cùng họ với site. Teal được giữ lại đúng chỗ nó có giá trị: **màu dữ liệu trong biểu đồ**.

**`taste-skill`** tự ghi rõ phạm vi: *"Landing pages, portfolios, and redesigns. **Not dashboards, not data tables, not multi-step product UI**"* — nên chỉ lấy phần kỷ luật chống-mặc-định của nó (không gradient tím AI, không glassmorphism, không ba card đều nhau), bỏ phần layout landing page.

### Màu dữ liệu — tính chứ không ước lượng

Cặp categorical đã chạy qua validator của skill `dataviz`:

```
validate_palette.js "#0D9488,#4F46E5" --mode light --pairs all
  [PASS] Lightness band · Chroma floor
  [PASS] CVD separation      ΔE 22.1 (deutan)
  [PASS] Normal-vision floor ΔE 27.1
  [PASS] Contrast vs surface ≥ 3:1
```

Ba biểu đồ trong app đều **một chuỗi dữ liệu** → không cần legend, dùng đúng một màu teal. Màu trạng thái (`good` / `warn` / `bad`) là **dành riêng cho trạng thái**, không bao giờ tái dùng làm "chuỗi thứ hai", và luôn đi kèm chữ hoặc icon.

### Contrast — cũng tính

Kiểm tất cả token chữ trên 3 surface. Hai lỗi tìm ra và đã sửa:

| Token | Trước | Sau | Lý do |
|---|---|---|---|
| `ink-muted` | `#6B7F93` — 4.13:1 | `#566A7D` — 5.59:1 | Dùng cho hint 11–12px, phải đạt 4.5:1 |
| accent làm **chữ** | `#F47A1F` — 2.75:1 | `--color-accent-text: #A8500A` — 5.50:1 | Cam brand không đạt khi làm chữ; giữ nguyên để làm nền/viền |

Focus ring và viền tab dùng `accent-dark` (3.49:1 ≥ 3:1 cho graphical object).

### Checklist trước khi giao

- [x] Không emoji làm icon — toàn bộ là SVG stroke trong `components/ui/icons.ts`
- [x] `cursor-pointer` trên mọi thứ bấm được (khai ở `style.css`)
- [x] Hover có transition 150ms (`.t-fast`)
- [x] Chữ đạt contrast ≥ 4.5:1 trên mọi surface
- [x] Focus ring luôn thấy, không bị `outline: none`
- [x] Tôn trọng `prefers-reduced-motion`
- [x] Responsive 375 / 768 / 1024 / 1440 — bảng cuộn ngang trong khung riêng, cột phụ ẩn dưới `sm`
- [x] Route lazy-load (`() => import()`), mỗi trang một bundle
- [x] Empty state có thông báo + hành động, không để khung trắng
- [x] Nút ≥ 44px trên touch, ≥ 36px trên desktop

## Cần làm để chạy thật

Thứ tự này bắt buộc — không có bước 1 thì mọi số trên dashboard là số giả:

1. **Bảng dữ liệu** trong `lead-tracker-api`: `courses`, `course_modules`, `course_lessons`, `quiz_questions`, `course_sessions`, `learners`, `enrolments`, `lesson_progress`, `certificates`, `course_reviews`
2. **Đăng nhập thật**: thay `services/session.ts` bằng JWT của API (`requireAuth` + `bcryptjs` đã có sẵn), thêm role `instructor` / `admin`
3. **Tiến độ lên server**: site hiện lưu tiến độ học ở `localStorage`, nên instructor không thấy được gì — đây là điều kiện để `/analytics` có ý nghĩa
4. **Upload video**: mở rộng module `images` (đã có `@aws-sdk/s3-request-presigner`, và R2 dùng API tương thích S3) → presigned PUT cho file lớn, bỏ bước `sharp`
5. **Cổng thanh toán** — làm sau cùng; trước đó dùng "cấp quyền tay" trong `/learners`

## Cấu trúc

```
src/
  components/
    charts/     BarRanking · Sparkline   (SVG tự vẽ, không thư viện chart)
    course/     SyllabusBuilder
    ui/         AppButton · AppCard · DataTable · StatTile · AppModal · …
  composables/  useToast
  layouts/      AdminLayout
  mock/         data.ts        ← dữ liệu giả, xoá khi có API
  services/     api.ts         ← ranh giới dữ liệu duy nhất
                session.ts
  utils/        format.ts      ← vnd, clock, mb, bitrateMbps, fold
  views/        11 trang
```
