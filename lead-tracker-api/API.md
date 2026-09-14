# lead-tracker-api — bản đồ endpoint

Backend dùng chung cho ba frontend: `site` (công khai), `restorative-crm` và `instructor-admin` (nội bộ).

Mọi response đều một khuôn:

```jsonc
{ "success": true,  "data": { … } }
{ "success": false, "error": { "code": "NOT_FOUND", "message": "…" } }
```

---

## Chạy ở local

```bash
# 1. Postgres (nếu chưa có sẵn)
docker compose up -d

# 2. Cấu hình
cp .env.example .env        # sửa DB_*, JWT_SECRET, ADMIN_EMAIL, ADMIN_PASSWORD

# 3. Tạo bảng + nạp dữ liệu mẫu
npm run db:migrate          # chạy schema.sql (không cần psql)
npm run seed                # dữ liệu cũ: spa services, blog, tài khoản admin
npm run seed:console        # dữ liệu console: khoá học, học viên, đơn hàng…

# 4. Chạy
npm run dev                 # http://localhost:3001
```

`db:migrate` và `seed:console` đều **chạy lại được nhiều lần**: schema toàn `IF NOT EXISTS`, seed toàn `ON CONFLICT DO NOTHING`.

### Dữ liệu mẫu đến từ đâu

`src/data/seed/console-seed.json` được sinh ra từ chính mock của `restorative-crm`, nên số liệu trên console khớp với cái nó được thiết kế quanh:

```bash
npm run seed:generate   # đọc restorative-crm/src/data/mock/* → snapshot JSON
npm run seed:check      # đối chiếu snapshot với schema.sql (không cần DB)
```

### Kiểm tra API chạy đúng

```bash
npm run dev             # ở một terminal khác
npm run test:smoke      # 67 phép thử, gọi thật vào API đang chạy
```

`test:smoke` không chỉ kiểm 200/404: nó xác nhận `PATCH` không đè field khác, khách vãng lai không đọc được bản nháp, `coupons/validate` không tiêu lượt, cấp quyền hai lần không tạo bản ghi trùng, và `lesson-progress/track` không kéo lùi mốc đã xem. Chạy mất khoảng 1–2 phút vì phải chờ hết cửa sổ rate limit.

Test tạo vài dòng rồi tự xoá. Nếu một lần chạy chết giữa chừng, dọn bằng:
`DELETE FROM translations WHERE namespace='smoke'`, `DELETE FROM coupons WHERE code LIKE 'SMOKE-%'`.

Snapshot được commit vào repo có chủ ý: seed không phụ thuộc lúc chạy vào package frontend, nên `npm run seed:console` không chết vào ngày ai đó dời file bên console.

---

## Xác thực

| Endpoint | Quyền | Ghi chú |
|---|---|---|
| `POST /api/v1/auth/login` | công khai | `{ email, password }` → `{ token, admin }`, JWT 7 ngày |
| `GET /api/v1/auth/me` | admin | |

Endpoint admin cần `Authorization: Bearer <token>`.
Riêng playback video còn nhận `x-service-token` (site gọi thay học viên) — xem `LESSON-VIDEOS.md`.

### Giới hạn tần suất

`RATE_LIMIT_MAX=120` request / `RATE_LIMIT_WINDOW_MS=60000` (1 phút), tính theo IP, chỉ `/health` được bỏ qua. Vượt thì nhận `429 RATE_LIMIT_EXCEEDED`.

⚠️ Con số này **dễ chạm khi console dùng thật**: một trang dashboard mở 8 widget, cộng thao tác lọc/phân trang là hết vài chục request trong vài giây. Nếu anh thấy 429 lúc dev, nâng `RATE_LIMIT_MAX` trong `.env` — em để nguyên vì đây là cấu hình bảo vệ, không phải thứ nên tự ý nới.

---

## Quy ước chung cho mọi resource CRUD

Sinh ra từ `src/core/crud.ts`. Mỗi resource có đủ 6 route:

| Method | Path | Việc |
|---|---|---|
| `GET` | `/` | danh sách, có lọc / sắp xếp / phân trang |
| `GET` | `/:id` | một bản ghi |
| `POST` | `/` | tạo |
| `PATCH` | `/` | sửa hàng loạt — `{ ids: [], patch: {} }` |
| `PATCH` | `/:id` | sửa một phần |
| `DELETE` | `/:id` | xoá |

**Query param cho `GET /`:**

| Param | Ý nghĩa |
|---|---|
| `page`, `limit` | phân trang (mặc định 1 / 100, tối đa 500) |
| `sort` | `field` tăng dần, `-field` giảm dần — chỉ nhận field trong danh sách cho phép |
| `q` | tìm ILIKE trên vài cột của resource |
| *(khác)* | lọc chính xác, ví dụ `?status=active`. Nhiều giá trị: `?status=active,idle` |

**Kết quả danh sách:**

```jsonc
{ "success": true, "data": { "programs": [ … ], "total": 10, "page": 1, "limit": 100 } }
```

Key của mảng chính là tên resource, không phải `items` — để đọc log là biết ngay đang xem cái gì.

### Endpoint "đọc công khai" không có nghĩa là đọc được tất cả

Resource nào mở cho site đọc thì vẫn **lọc bớt với người chưa đăng nhập**:

| Resource | Khách vãng lai thấy |
|---|---|
| `/programs` | chỉ `status = published` |
| `/pages`, `/faqs` | chỉ `status = published` |

Gửi kèm bearer token thì thấy đầy đủ — cùng một URL, không cần route riêng. Bộ lọc được áp **sau** query param nên không thể dùng `?status=draft` để lách, và `GET /:id` cũng trả 404 (không phải 403) với bản nháp, để endpoint không xác nhận là bản ghi có tồn tại.

---

## Academy

| Resource | Path | Đọc công khai? |
|---|---|---|
| Chương trình | `/api/v1/programs` | ✅ |
| Giảng viên | `/api/v1/instructors` | ✅ |
| Lịch khai giảng | `/api/v1/program-sessions` | ✅ |
| Học viên | `/api/v1/learners` | ❌ dữ liệu cá nhân |
| Ghi danh | `/api/v1/enrolments` | ❌ |
| Chứng nhận | `/api/v1/certificates` | ❌ |
| Đánh giá | `/api/v1/reviews` | ❌ (có route công khai riêng) |
| Tiến độ bài học | `/api/v1/lesson-progress` | ❌ |
| Chỉ mục video bài | `/api/v1/lesson-video-index` | ❌ |

**Route riêng:**

| Method | Path | Việc |
|---|---|---|
| `GET` | `/programs/slug/:slug` | site tra theo slug, không theo id |
| `POST` | `/programs/:id/duplicate` | nhân bản thành nháp, **bỏ** enrolled/revenue/rating |
| `POST` | `/enrolments/grant` | `{ learnerId, programId }` — cấp quyền tay. Hồi sinh bản ghi đã thu hồi thay vì tạo trùng |
| `POST` | `/enrolments/:id/revoke` | thu hồi, giữ lại bản ghi và tiến độ |
| `POST` | `/certificates/:id/revoke` | thu hồi, giữ bản ghi |
| `GET` | `/certificates/verify/:code` | **công khai** — QR trên chứng nhận in ra trỏ vào đây |
| `GET` | `/reviews/public/:programId` | **công khai** — chỉ đánh giá đã duyệt |
| `POST` | `/lesson-progress/track` | player gọi khi đang xem; upsert, và tính lại `percent` của ghi danh ngay |
| `GET` | `/lesson-video-index/missing` | những bài chưa gắn nguồn video |

**Báo cáo** (`/api/v1/academy-insights`, admin):

| Path | Trả về |
|---|---|
| `/drop-off` | mỗi bài: bao nhiêu người mở, bao nhiêu bỏ trước mốc 90%, **giây bỏ trung vị** |
| `/quiz-misses` | câu hỏi bị sai nhiều nhất, kèm tỉ lệ |
| `/dashboard` | học viên đang học · ghi danh theo tuần · tiến độ TB mỗi khoá · buổi sắp tới · đánh giá chờ duyệt |

Cả ba **tính từ dữ liệu thô** (`lesson_progress`, `quiz_attempts`), không phải số tổng hợp lưu sẵn.

---

## Sales

| Path | Ghi chú |
|---|---|
| `/api/v1/orders` | `total` luôn được tính lại từ `subtotal - discount`, không tin client |
| `/api/v1/payments` | |
| `/api/v1/coupons` | |
| `POST /orders/:id/enrol` | biến đơn **đã thanh toán** thành quyền học; từ chối đơn chưa trả tiền |
| `POST /payments/:id/confirm` | xác nhận đã nhận tiền **và** đánh dấu đơn đã thanh toán |
| `POST /coupons/validate` | **công khai** — `{ code, subtotal }` → `{ valid, discount, total }`. Không tiêu lượt |
| `GET /sales-insights/revenue?days=30` | doanh thu theo ngày, chỉ tính đơn đã thanh toán |
| `GET /sales-insights/summary` | đơn chờ · đã trả · **đã trả nhưng chưa cấp quyền** · doanh thu tháng |

> `orders.enrolled` tách khỏi `orders.status` có chủ ý: *đã thu tiền* và *đã có quyền học* là hai việc khác nhau, và "đơn đã trả tiền mà chưa cấp quyền" chính là thứ màn hình Đơn hàng sinh ra để tìm.

---

## Therapy

| Path | Đọc công khai? |
|---|---|
| `/api/v1/practitioners` | ✅ |
| `/api/v1/availability` | ✅ khung giờ lặp theo tuần |
| `/api/v1/time-off` | ❌ nghỉ phép theo ngày |
| `GET /api/v1/slots?practitionerId=&date=` | ✅ khung giờ **thực sự đặt được** |

`/slots` gộp cả ba yếu tố: lịch tuần → nghỉ phép đè lên → trừ booking đã có. Tính ở đây để site và console không bao giờ bất đồng về việc 15:00 còn trống hay không.

---

## Content

| Path | Ghi chú |
|---|---|
| `/api/v1/pages` | trang tĩnh |
| `/api/v1/faqs` | + `GET /faqs/public` — chỉ bài đã xuất bản, đã gom nhóm |
| `/api/v1/translations` | + `GET /translations/bundle/:locale` — `{ "namespace.key": "giá trị" }` |
| `/api/v1/media-assets` | thư viện ảnh |

`translations.status` được tính lại mỗi lần ghi (`ok` / `partial` / `missing`) — trạng thái dịch là **sự thật về bản ghi**, không phải ô để người dùng tự tick.

---

## CRM

| Path | Ghi chú |
|---|---|
| `/api/v1/enquiries` | yêu cầu đào tạo từ doanh nghiệp |
| `POST /enquiries/public` | **công khai** — form trên site. Chỉ tạo được enquiry `new` |
| `POST /enquiries/:id/note` | ghi nhận cuộc gọi + hẹn follow-up |
| `GET /api/v1/funnel?days=30` | phiên → bấm CTA → mở form → đặt lịch → xác nhận → đơn đã trả |
| `GET /api/v1/funnel/cta?days=30` | CTA nào thực sự có tác dụng |

Funnel **đo từ** `lead_events` + `bookings` + `orders`, không lưu sẵn. Mỗi bước đếm session phân biệt, nên người bấm 3 CTA vẫn là một người.

---

## System

| Path | Ghi chú |
|---|---|
| `/api/v1/users` | danh sách người vận hành |
| `GET`/`POST` `/api/v1/audit-log` | **chỉ ghi thêm** — không có sửa/xoá |
| `GET /api/v1/settings` | tất cả section |
| `GET`/`PATCH` `/api/v1/settings/:section` | `general`, `booking`, `academy`, `payments`, `integrations` |

`PATCH /settings/:section` merge ở mức field: form gửi field nào thì field đó đổi, còn lại giữ nguyên.

> `app_users` là **danh sách**, không phải kho mật khẩu. API vẫn xác thực bằng cặp `ADMIN_EMAIL`/`ADMIN_PASSWORD`; một dòng trong bảng này không cấp quyền gì cả.

---

## Learner — dành cho học viên trên stretch.vn

Toàn bộ nhóm này **chỉ site gọi**, bằng header `x-service-token`, **không phải trình duyệt**. Site giữ phiên Google, xác định ai đang đăng nhập, rồi truyền `learnerId` xuống. Quy tắc sống còn:

> **Site phải lấy `learnerId` từ phiên đăng nhập của chính nó, tuyệt đối không lấy từ request mà nó đang phục vụ.**

| Method | Path | Việc |
|---|---|---|
| `POST` | `/learner/identify` | Đăng nhập **và** đăng ký trong một lần gọi. Lần đầu tạo học viên, các lần sau cập nhật hồ sơ + đóng dấu thời điểm đăng nhập |
| `GET` | `/learner/:id/courses` | Khoá đang học + đã xong, kèm sẵn điểm học dở để "học tiếp" |
| `GET` | `/learner/:id/access/:slug` | Được xem khoá này không → `enrolled` / `free` / `not-enrolled` |
| `POST` | `/learner/:id/progress` | Player báo đã xem tới đâu. **Từ chối nếu chưa ghi danh** |
| `GET` | `/learner/:id/certificates` | Chứng nhận còn hiệu lực |

**Không có form đăng ký riêng.** Google đã xác định người này là ai; bắt điền lại tên và email sau đó chỉ làm rơi người dùng giữa hai màn hình.

Ghép tài khoản theo `google_sub` trước, email sau:
- `google_sub` bền vững khi người dùng **đổi email Google** — không có nó thì họ quay lại như người lạ và mất sạch khoá đã mua.
- Ghép theo email là cách **nhận lại học viên do admin tạo tay** trước khi họ đăng nhập lần đầu — đúng luồng người chuyển khoản rồi được cấp quyền.

Email so khớp **không phân biệt hoa thường** (unique index trên `LOWER(email)`).

Kiểm tra: `npm run test:learner` (15 phép thử, gồm cả các phép **từ chối** — token sai, ghi tiến độ cho khoá chưa ghi danh).

## Video khoá học trên R2

`npm run test:r2` đi đúng đường trình duyệt sẽ đi: xin ticket → PUT từng part thẳng lên R2 → ghép → link phát có chữ ký → xoá. 7 phép thử, gồm cả **kiểm tra bucket thật sự private** (URL không chữ ký phải bị từ chối — bucket public thì việc ký là vô nghĩa).

Policy CORS nằm ở `r2-video-cors.json`, **định dạng của wrangler** (`rules[].allowed.origins`), khác định dạng dashboard (`AllowedOrigins`):

```bash
npx wrangler r2 bucket cors set <bucket> --file r2-video-cors.json
npx wrangler r2 bucket cors list <bucket>
```

## Các module có từ trước

| Path | Ghi chú |
|---|---|
| `/api/v1/tracking` | công khai — tracking từ site |
| `/api/v1/bookings` | POST + `/availability` công khai, còn lại admin |
| `/api/v1/blog`, `/api/v1/categories` | GET công khai, ghi thì admin |
| `/api/v1/images` | upload ảnh lên R2 |
| `/api/v1/videos` | upload video bài giảng lên R2 — xem `LESSON-VIDEOS.md` |
| `/api/v1/mentorship` | buổi kèm 1-1 |
| `/api/v1/analytics`, `/google-analytics`, `/search-console` | admin |
