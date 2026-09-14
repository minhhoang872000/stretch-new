# Video bài học trên Cloudflare R2

Instructor tải video từ console → file nằm trong R2 → site phát lại bằng link có
chữ ký, hết hạn sau ít phút.

```
Console (SPA)                 API (Render)                 R2                 Site (Nuxt)
     │  POST /videos/uploads      │                          │                     │
     │ ─────────────────────────► │ CreateMultipartUpload    │                     │
     │ ◄── ticket + presigned URL │ ───────────────────────► │                     │
     │  PUT từng part ─────────────────────────────────────► │  (bytes KHÔNG qua API)
     │  POST …/complete ────────► │ CompleteMultipartUpload  │                     │
     │                            │                          │                     │
     │                     GET /videos/lesson?slug&ordinal   │  ◄── x-service-token │
     │                            │ ── presigned GET (30′) ─►│ ────────────────────►│
     │                            │                          │  <video src=…>  ◄────│
```

Bytes không đi qua API: một bài giảng 1,5 GB không bị giới hạn kích thước
request của Render, và băng thông ra khỏi R2 thì Cloudflare không tính phí.

## 1. Tạo bucket riêng cho video

Bucket ảnh (`R2_BUCKET`) đang public qua `R2_PUBLIC_BASE_URL`. **Đừng để video
chung bucket đó** — public thì link có chữ ký thành vô nghĩa.

```bash
npx wrangler r2 bucket create stretch-lesson-videos
```

Không bật r2.dev, không gắn custom domain cho bucket này.

## 2. CORS cho bucket video

Trình duyệt PUT trực tiếp lên R2, nên bucket phải cho phép origin của console.
`ExposeHeaders: ["ETag"]` là **bắt buộc** với multipart: không có nó, browser
không đọc được ETag của từng part và bước `complete` sẽ lỗi.

```json
[
  {
    "AllowedOrigins": [
      "https://admin.stretch.vn",
      "http://localhost:5173"
    ],
    "AllowedMethods": ["PUT"],
    "AllowedHeaders": ["content-type"],
    "ExposeHeaders": ["ETag"],
    "MaxAgeSeconds": 3600
  }
]
```

Dán vào R2 → bucket → Settings → CORS Policy.

## 3. Biến môi trường

Trên Render (API):

| Biến | Ý nghĩa |
|---|---|
| `R2_VIDEO_BUCKET` | Bucket private vừa tạo |
| `R2_VIDEO_PREFIX` | Mặc định `lessons` |
| `R2_VIDEO_MAX_BYTES` | Mặc định 3 GB |
| `R2_VIDEO_PART_SIZE` | Mặc định 16 MB (R2 yêu cầu ≥ 5 MB mỗi part, trừ part cuối) |
| `R2_VIDEO_PLAYBACK_TTL` | Hạn của link phát, mặc định 1800s |
| `SITE_SERVICE_TOKEN` | Chuỗi random dài — site dùng để xin link phát |

`R2_ACCOUNT_ID` / `R2_ACCESS_KEY_ID` / `R2_SECRET_ACCESS_KEY` dùng lại của ảnh
(API token phải có quyền ghi cả bucket video).

Trên Cloudflare Pages (site):

| Biến | Ý nghĩa |
|---|---|
| `NUXT_LESSON_API_BASE` | `https://…/api/v1` của API |
| `NUXT_SITE_SERVICE_TOKEN` | Đúng chuỗi `SITE_SERVICE_TOKEN` ở trên |

Cả hai biến của site đều **server-only** — không đặt tiền tố `NUXT_PUBLIC_`,
nếu không token sẽ lộ ra trình duyệt.

## 4. Bảng trong Postgres

```bash
psql "$DATABASE_URL" -f schema.sql   # đã có sẵn CREATE TABLE IF NOT EXISTS lesson_videos
```

## 5. Endpoint

| Method | Đường dẫn | Ai gọi được |
|---|---|---|
| POST | `/api/v1/videos/uploads` | admin — mở multipart, trả presigned URL từng part |
| POST | `/api/v1/videos/uploads/simple` | admin — một presigned PUT cho cả file (đường dự phòng) |
| POST | `/api/v1/videos/uploads/:id/complete` | admin — ghép part |
| POST | `/api/v1/videos/uploads/:id/confirm` | admin — chốt đường simple |
| POST | `/api/v1/videos/uploads/:id/abort` | admin — huỷ |
| GET | `/api/v1/videos` | admin — thư viện video |
| PATCH | `/api/v1/videos/:id` | admin — gắn vào bài học, đổi tên, ghi thời lượng |
| DELETE | `/api/v1/videos/:id` | admin — xoá cả object trong R2 |
| GET | `/api/v1/videos/:id/playback` | admin **hoặc** site (service token) |
| GET | `/api/v1/videos/lesson?slug=&ordinal=` | admin **hoặc** site (service token) |

Học viên không bao giờ gọi API này. Trình duyệt học viên gọi
`stretch.vn/api/lessons/video`, site kiểm tra phiên đăng nhập rồi mới xin link.

## 6. Kiểm tra nhanh sau khi cấu hình

```bash
TOKEN=<jwt admin>

# 1. Xin ticket cho một file 40 MB
curl -s -X POST https://…/api/v1/videos/uploads \
  -H "Authorization: Bearer $TOKEN" -H 'Content-Type: application/json' \
  -d '{"filename":"bai-1.mp4","contentType":"video/mp4","sizeBytes":41943040}' | jq

# 2. Site xin link phát (giả lập)
curl -s -H "x-service-token: $SITE_SERVICE_TOKEN" \
  "https://…/api/v1/videos/lesson?slug=giai-phau-ung-dung-cho-stretching&ordinal=0" | jq
```

## 7. Giới hạn cần biết

- **Không transcode.** R2 là kho object, không phải Cloudflare Stream: file nào
  tải lên thì phát đúng file đó. Instructor nên xuất **MP4 H.264 + AAC**; `.mov`
  hoặc `.mkv` tải lên được nhưng Safari/Chrome có thể không phát.
  Không có adaptive bitrate — mạng yếu thì buffer, không tự hạ chất lượng.
- **Link phát copy được trong thời gian còn hạn** (mặc định 30 phút). Muốn chặt
  hơn thì hạ `R2_VIDEO_PLAYBACK_TTL`, hoặc đổi sang Cloudflare Stream (signed
  token theo người xem) — khi đó chỉ `playbackFor()` phải viết lại.
- **Multipart bị R2 từ chối presign?** Cloudflare chỉ ghi rõ presigned URL cho
  GET/HEAD/PUT/DELETE. Console tự phát hiện (403 ở part đầu) và chuyển sang
  đường `uploads/simple` — mất khả năng tải lại từng part, nhưng vẫn xong việc.
- **Upload dở dang** để lại row `status = 'uploading'`; R2 tự xoá part sau 7
  ngày. Xoá row bằng `POST /uploads/:id/abort`.
