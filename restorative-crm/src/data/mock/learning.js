/**
 * Learning Hub mock data — mirrors what stretch.vn actually renders.
 *
 * Shapes follow the site's composables so a later API swap is a data-source
 * change, not a UI rewrite:
 *   programs   ← site/composables/useLearningCatalog.ts   (CatalogProgram)
 *   modules    ← site/composables/useProgramDetail.ts     (SyllabusModule)
 *   sessions   ← site/composables/useLearningSchedule.ts  (ScheduleEntry)
 *   enrolments ← site/composables/useMyLearning.ts        (ActiveEnrolment)
 *   videos     ← site/server/utils/lessonVideos.ts        (ordinal → youtube id)
 */

import {
  rng, pick, int, weighted, shiftDate, shiftStamp, initials,
  NAMES, email, phone, slug,
} from './_util.js'

const rand = rng(20260821)

export const PROGRAM_KINDS = [
  { value: 'course', label: 'Khoá đầy đủ' },
  { value: 'mini', label: 'Mini course' },
  { value: 'workshop', label: 'Workshop' },
]

export const PROGRAM_TOPICS = [
  { value: 'anatomy', label: 'Giải phẫu' },
  { value: 'assessment', label: 'Đánh giá' },
  { value: 'sports', label: 'Thể thao' },
  { value: 'functional', label: 'Vận động chức năng' },
]

export const PROGRAM_MODES = [
  { value: 'online', label: 'Trực tuyến' },
  { value: 'offline', label: 'Tại studio' },
]

export const PROGRAM_STATUSES = [
  { value: 'published', label: 'Đang bán' },
  { value: 'draft', label: 'Nháp' },
  { value: 'archived', label: 'Lưu trữ' },
]

export const LESSON_TYPES = [
  { value: 'video', label: 'Video', icon: 'play_circle' },
  { value: 'reading', label: 'Bài đọc', icon: 'article' },
  { value: 'quiz', label: 'Quiz', icon: 'checklist' },
]

// ─────────────────────────────── Giảng viên ───────────────────────────────

export const instructors = [
  {
    id: 'ins-01',
    name: 'Trần Bảo Duy',
    role: 'Trưởng ban đào tạo',
    email: 'duy.tran@stretch.vn',
    phone: '090 418 2277',
    bio: 'Mười một năm làm trị liệu vận động, phụ trách toàn bộ nhóm học phần giải phẫu của học viện.',
    specialties: ['anatomy', 'assessment'],
    programs: 4,
    learners: 612,
    rating: 4.8,
    status: 'active',
    joinedAt: '2021-03-14',
  },
  {
    id: 'ins-02',
    name: 'Nguyễn Mỹ Linh',
    role: 'Chuyên gia đánh giá vận động',
    email: 'linh.nguyen@stretch.vn',
    phone: '093 771 0846',
    bio: 'Xây dựng bộ test đánh giá dáng đi đang dùng ở cả ba studio.',
    specialties: ['assessment', 'functional'],
    programs: 3,
    learners: 388,
    rating: 4.7,
    status: 'active',
    joinedAt: '2022-01-09',
  },
  {
    id: 'ins-03',
    name: 'Phạm Hữu Nghĩa',
    role: 'HLV phục hồi thể thao',
    email: 'nghia.pham@stretch.vn',
    phone: '097 240 5518',
    bio: 'Làm việc với vận động viên golf và chạy bộ phong trào ở TP.HCM.',
    specialties: ['sports'],
    programs: 2,
    learners: 274,
    rating: 4.6,
    status: 'active',
    joinedAt: '2022-08-22',
  },
  {
    id: 'ins-04',
    name: 'Lê Thị Quỳnh Như',
    role: 'Trị liệu viên lâm sàng',
    email: 'nhu.le@stretch.vn',
    phone: '086 903 1174',
    bio: 'Phụ trách các workshop thực hành tại studio Quận 1.',
    specialties: ['anatomy', 'functional'],
    programs: 2,
    learners: 163,
    rating: 4.9,
    status: 'active',
    joinedAt: '2023-05-02',
  },
  {
    id: 'ins-05',
    name: 'Đặng Minh Quân',
    role: 'HLV vận động chức năng',
    email: 'quan.dang@stretch.vn',
    phone: '035 662 4093',
    bio: 'Đang trong giai đoạn kèm cặp, chưa nhận lớp độc lập.',
    specialties: ['functional'],
    programs: 1,
    learners: 41,
    rating: 4.4,
    status: 'onboarding',
    joinedAt: '2026-04-18',
  },
]

// ─────────────────────────────── Chương trình ───────────────────────────────

const PROGRAM_SEED = [
  {
    title: 'Giải phẫu ứng dụng cho Stretching',
    kind: 'course', mode: 'online', topic: 'anatomy',
    price: 2490000, level: 'Trung cấp', instructor: 'ins-01',
    status: 'published', certificate: true, enrolled: 418, rating: 4.8, reviews: 96,
    badge: 'Bán chạy',
    subtitle: 'Đọc được cấu trúc cơ — khớp trước khi chạm tay vào khách.',
    outcomes: [
      'Chỉ ra nhóm cơ chịu tải trong từng động tác kéo giãn',
      'Phân biệt giới hạn do cơ và giới hạn do khớp',
      'Đọc bệnh sử vận động để chọn kỹ thuật phù hợp',
    ],
  },
  {
    title: 'Đánh giá vận động cơ bản',
    kind: 'course', mode: 'online', topic: 'assessment',
    price: 1890000, level: 'Cơ bản', instructor: 'ins-02',
    status: 'published', certificate: true, enrolled: 306, rating: 4.7, reviews: 71,
    badge: null,
    subtitle: 'Bộ 12 test dùng được ngay trong buổi đầu gặp khách.',
    outcomes: [
      'Chạy đủ bộ test trong 20 phút',
      'Ghi phiếu đánh giá theo mẫu của studio',
      'Chuyển kết quả test thành kế hoạch 4 tuần',
    ],
  },
  {
    title: 'Stretch cho người chơi golf',
    kind: 'mini', mode: 'online', topic: 'sports',
    price: 690000, level: 'Cơ bản', instructor: 'ins-03',
    status: 'published', certificate: false, enrolled: 187, rating: 4.6, reviews: 38,
    badge: null,
    subtitle: 'Xoay thân, vai và háng cho người chơi cuối tuần.',
    outcomes: ['Kiểm tra biên độ xoay thân', 'Chuỗi khởi động 9 phút trước tee-off'],
  },
  {
    title: 'Giải phẫu vai và cột sống cổ',
    kind: 'mini', mode: 'online', topic: 'anatomy',
    price: 590000, level: 'Cơ bản', instructor: 'ins-01',
    status: 'published', certificate: false, enrolled: 241, rating: 4.5, reviews: 44,
    badge: 'Mới',
    subtitle: 'Phần khó nhất của vùng cổ vai, gói trong sáu buổi ngắn.',
    outcomes: ['Nhận diện 6 mốc xương vùng vai', 'Tránh 3 lỗi kéo giãn cổ thường gặp'],
  },
  {
    title: 'Workshop thực hành: khớp háng và chậu',
    kind: 'workshop', mode: 'offline', topic: 'functional',
    price: 1200000, level: 'Trung cấp', instructor: 'ins-04',
    status: 'published', certificate: true, enrolled: 64, rating: 4.9, reviews: 22,
    badge: 'Còn ít chỗ',
    subtitle: 'Một ngày thực hành trên bàn, tối đa 12 người.',
    outcomes: ['Thao tác 8 kỹ thuật vùng háng', 'Bắt tay chỉnh tư thế cho bạn học'],
  },
  {
    title: 'Stretch phục hồi sau chạy bộ',
    kind: 'mini', mode: 'online', topic: 'sports',
    price: 490000, level: 'Cơ bản', instructor: 'ins-03',
    status: 'published', certificate: false, enrolled: 158, rating: 4.4, reviews: 29,
    badge: null,
    subtitle: 'Chuỗi hồi phục 18 phút cho runner phong trào.',
    outcomes: ['Xử lý căng bắp chân sau buổi dài', 'Lịch giãn cho tuần có race'],
  },
  {
    title: 'Chương trình huấn luyện viên 40 giờ',
    kind: 'course', mode: 'offline', topic: 'functional',
    price: 12800000, level: 'Nâng cao', instructor: 'ins-01',
    status: 'published', certificate: true, enrolled: 37, rating: 4.9, reviews: 14,
    badge: 'Cấp chứng nhận',
    subtitle: 'Lộ trình nghề nghiệp đầy đủ, có thi thực hành cuối khoá.',
    outcomes: [
      'Đủ năng lực nhận khách 1:1 độc lập',
      'Vượt bài thi thực hành 90 phút',
      'Hồ sơ 10 ca thực tập có nhận xét',
    ],
  },
  {
    title: 'Đánh giá dáng đi và thăng bằng',
    kind: 'course', mode: 'online', topic: 'assessment',
    price: 2190000, level: 'Trung cấp', instructor: 'ins-02',
    status: 'published', certificate: true, enrolled: 122, rating: 4.6, reviews: 31,
    badge: null,
    subtitle: 'Quan sát dáng đi bằng điện thoại, không cần phòng lab.',
    outcomes: ['Quay và phân tích dáng đi 4 mặt phẳng', 'Phân loại 5 kiểu lệch phổ biến'],
  },
  {
    title: 'Stretch cho dân văn phòng',
    kind: 'mini', mode: 'online', topic: 'functional',
    price: 0, level: 'Cơ bản', instructor: 'ins-05',
    status: 'published', certificate: false, enrolled: 903, rating: 4.3, reviews: 118,
    badge: 'Miễn phí',
    subtitle: 'Khoá mở đầu miễn phí — cũng là phễu chính của học viện.',
    outcomes: ['Ba chuỗi giãn tại bàn làm việc', 'Nhận biết dấu hiệu quá tải cổ vai'],
  },
  {
    title: 'Workshop hồi phục vai gáy',
    kind: 'workshop', mode: 'offline', topic: 'anatomy',
    price: 950000, level: 'Cơ bản', instructor: 'ins-04',
    status: 'draft', certificate: false, enrolled: 0, rating: 0, reviews: 0,
    badge: null,
    subtitle: 'Bản nháp cho quý 4, chưa mở bán.',
    outcomes: ['Sờ nắn mốc xương vùng vai', 'Chuỗi giãn 25 phút cho khách văn phòng'],
  },
]

const MODULE_TITLES = {
  anatomy: ['Nền tảng giải phẫu', 'Cơ và mạc', 'Khớp và biên độ', 'Ứng dụng trên bàn'],
  assessment: ['Chuẩn bị buổi đánh giá', 'Bộ test tĩnh', 'Bộ test động', 'Ghi phiếu và kế hoạch'],
  sports: ['Hiểu môn thể thao', 'Khởi động chuyên biệt', 'Hồi phục sau buổi tập', 'Lịch theo tuần'],
  functional: ['Nguyên tắc vận động', 'Chuỗi động tác cơ bản', 'Biến thể theo khách', 'Thực hành có phản hồi'],
}

const LESSON_TITLES = {
  video: [
    'Vào bài: cách dùng khoá học này', 'Mốc xương cần sờ được', 'Kỹ thuật kéo giãn thụ động',
    'Đặt tay và hướng lực', 'Sai lầm thường gặp khi thao tác', 'Chuỗi bài 12 phút',
    'Điều chỉnh cho khách cứng khớp', 'Quay lại buổi thực hành mẫu',
  ],
  reading: [
    'Ghi chú giải phẫu kèm hình', 'Phiếu đánh giá in được', 'Bảng đối chiếu biên độ',
    'Danh sách chống chỉ định', 'Mẫu kế hoạch 4 tuần',
  ],
  quiz: ['Kiểm tra nhanh phần này', 'Bài kiểm tra cuối chương', 'Tình huống thực hành'],
}

const QUIZ_BANK = [
  {
    question: 'Giới hạn biên độ do khớp khác giới hạn do cơ ở điểm nào?',
    options: ['Cảm giác chặn cứng, đột ngột', 'Cảm giác căng dần, còn dịch chuyển', 'Chỉ đau khi chịu tải', 'Không phân biệt được trên lâm sàng'],
    answer: 0,
  },
  {
    question: 'Trước khi kéo giãn vùng cổ, việc cần làm đầu tiên là gì?',
    options: ['Tăng biên độ tối đa', 'Sàng lọc chống chỉ định và bệnh sử', 'Dùng dây hỗ trợ', 'Chườm nóng 10 phút'],
    answer: 1,
  },
  {
    question: 'Chuỗi hồi phục sau buổi chạy dài nên bắt đầu từ đâu?',
    options: ['Bắp chân và gân Achilles', 'Cơ ngực', 'Cột sống cổ', 'Cơ tam đầu'],
    answer: 0,
  },
]

/** Build a syllabus that looks hand-made: uneven module sizes, a couple of free previews. */
function buildModules(program) {
  const titles = MODULE_TITLES[program.topic]
  const count = program.kind === 'course' ? int(rand, 4, 4) : program.kind === 'mini' ? 3 : 2
  const modules = []
  let ordinal = 0

  for (let m = 0; m < count; m += 1) {
    const itemCount = program.kind === 'course' ? int(rand, 4, 6) : int(rand, 3, 4)
    const items = []
    for (let i = 0; i < itemCount; i += 1) {
      const type = i === itemCount - 1 && m > 0
        ? 'quiz'
        : weighted(rand, [['video', 6], ['reading', 2], ['quiz', 1]])
      const item = {
        type,
        title: pick(rand, LESSON_TITLES[type]),
        minutes: type === 'video' ? int(rand, 6, 24) : type === 'reading' ? int(rand, 4, 11) : int(rand, 3, 8),
        free: m === 0 && i < 2,
      }
      if (type === 'video') {
        item.ordinal = ordinal
        ordinal += 1
      }
      if (type === 'quiz') {
        item.questions = [pick(rand, QUIZ_BANK), pick(rand, QUIZ_BANK)]
        item.passScore = 70
      }
      items.push(item)
    }
    modules.push({
      title: titles[m % titles.length],
      summary: 'Phần này gom các bài cần học liền nhau, không nên nhảy thứ tự.',
      items,
      minutes: items.reduce((s, it) => s + it.minutes, 0),
    })
  }
  return modules
}

export const programs = PROGRAM_SEED.map((seed, i) => {
  const modules = buildModules(seed)
  const lessons = modules.reduce((s, m) => s + m.items.length, 0)
  const minutes = modules.reduce((s, m) => s + m.minutes, 0)
  return {
    id: `prg-${String(i + 1).padStart(2, '0')}`,
    slug: slug(seed.title),
    title: seed.title,
    subtitle: seed.subtitle,
    kind: seed.kind,
    mode: seed.mode,
    topic: seed.topic,
    level: seed.level,
    language: 'Tiếng Việt',
    price: seed.price,
    compareAtPrice: seed.price > 0 && i % 3 === 0 ? Math.round(seed.price * 1.28) : null,
    status: seed.status,
    badge: seed.badge,
    certificate: seed.certificate,
    instructorId: seed.instructor,
    image: `https://picsum.photos/seed/${slug(seed.title)}/640/400`,
    outcomes: seed.outcomes,
    skills: PROGRAM_TOPICS.filter((t) => t.value === seed.topic).map((t) => t.label),
    lessons,
    minutes,
    modules,
    enrolled: seed.enrolled,
    rating: seed.rating,
    reviewCount: seed.reviews,
    revenue: seed.price * Math.round(seed.enrolled * 0.72),
    updatedAt: shiftStamp(-int(rand, 1, 46), int(rand, 8, 18), int(rand, 3, 57)),
    publishedAt: seed.status === 'published' ? shiftDate(-int(rand, 60, 420)) : null,
    seo: {
      title: `${seed.title} — Học viện Stretch`,
      description: seed.subtitle,
      ogImage: `https://picsum.photos/seed/${slug(seed.title)}-og/1200/630`,
    },
    faq: [
      { q: 'Học xong có cần thi không?', a: seed.certificate ? 'Có, một bài thi cuối khoá để lấy chứng nhận.' : 'Không, khoá này không có bài thi.' },
      { q: 'Bao lâu thì hết quyền xem?', a: 'Quyền xem không hết hạn khi tài khoản còn hoạt động.' },
    ],
  }
})

export const programById = (id) => programs.find((p) => p.id === id) || null

// ─────────────────────── Lịch khai giảng (sessions) ───────────────────────

const LOCATIONS = [
  'Studio Quận 1 — 24 Lê Thánh Tôn',
  'Studio Thảo Điền — 51 Xuân Thuỷ',
  'Studio Hà Nội — 18 Trần Hưng Đạo',
  'Zoom (link gửi trước 24h)',
]

export const sessions = Array.from({ length: 16 }, (_, i) => {
  const program = pick(rand, programs.filter((p) => p.status === 'published'))
  const offset = int(rand, -34, 68)
  const capacity = program.mode === 'offline' ? int(rand, 10, 16) : int(rand, 25, 60)
  const booked = Math.min(capacity, int(rand, 2, capacity + 2))
  const seatsLeft = Math.max(0, capacity - booked)
  return {
    id: `ses-${String(i + 1).padStart(2, '0')}`,
    programId: program.id,
    programTitle: program.title,
    kind: program.kind,
    mode: program.mode,
    date: shiftDate(offset),
    time: pick(rand, ['09:00 – 12:00', '13:30 – 17:00', '18:30 – 21:00', '08:30 – 16:30']),
    location: program.mode === 'offline' ? pick(rand, LOCATIONS.slice(0, 3)) : LOCATIONS[3],
    instructorId: program.instructorId,
    capacity,
    booked,
    seatsLeft,
    seatStatus: seatsLeft === 0 ? 'full' : seatsLeft <= 3 ? 'few' : 'open',
    status: offset < -1 ? 'done' : offset === 0 ? 'today' : 'upcoming',
    note: seatsLeft === 0 ? 'Đã kín chỗ, đang giữ danh sách chờ.' : '',
  }
}).sort((a, b) => a.date.localeCompare(b.date))

// ─────────────────────────────── Học viên ───────────────────────────────

const SOURCES = ['Khoá miễn phí', 'Facebook Ads', 'Giới thiệu', 'Google', 'Sự kiện offline', 'Blog']

export const learners = NAMES.slice(0, 24).map((name, i) => {
  const joined = shiftDate(-int(rand, 3, 520))
  return {
    id: `lrn-${String(i + 1).padStart(3, '0')}`,
    name,
    initials: initials(name),
    email: email(rand, name),
    phone: phone(rand),
    city: pick(rand, ['TP.HCM', 'TP.HCM', 'Hà Nội', 'Đà Nẵng', 'Bình Dương', 'Cần Thơ']),
    job: pick(rand, ['HLV cá nhân', 'Nhân viên văn phòng', 'Kỹ thuật viên trị liệu', 'Giáo viên yoga', 'Sinh viên VLTL', 'Chủ phòng tập']),
    source: pick(rand, SOURCES),
    joinedAt: joined,
    lastActiveAt: shiftStamp(-int(rand, 0, 40), int(rand, 7, 22), int(rand, 1, 58)),
    status: weighted(rand, [['active', 8], ['idle', 3], ['blocked', 1]]),
    note: '',
  }
})

// ─────────────────────────────── Ghi danh ───────────────────────────────

export const enrolments = (() => {
  const rows = []
  let n = 0
  for (const learner of learners) {
    const count = int(rand, 1, 3)
    const chosen = new Set()
    for (let i = 0; i < count; i += 1) {
      const program = pick(rand, programs.filter((p) => p.status === 'published'))
      if (chosen.has(program.id)) continue
      chosen.add(program.id)
      n += 1
      const status = weighted(rand, [['active', 6], ['completed', 3], ['revoked', 1]])
      const percent = status === 'completed' ? 100 : int(rand, 4, 92)
      const lessonsDone = Math.round((percent / 100) * program.lessons)
      rows.push({
        id: `enr-${String(n).padStart(3, '0')}`,
        learnerId: learner.id,
        learnerName: learner.name,
        programId: program.id,
        programTitle: program.title,
        mode: program.mode,
        status,
        percent,
        lessonsDone,
        lessons: program.lessons,
        source: program.price === 0 ? 'free' : weighted(rand, [['order', 7], ['manual', 2]]),
        startedAt: shiftDate(-int(rand, 5, 300)),
        lastLessonAt: shiftStamp(-int(rand, 0, 60), int(rand, 6, 23), int(rand, 0, 59)),
        completedAt: status === 'completed' ? shiftDate(-int(rand, 1, 120)) : null,
        quizAvg: int(rand, 58, 98),
        note: status === 'revoked' ? 'Thu hồi vì hoàn tiền đơn hàng.' : '',
      })
    }
  }
  return rows
})()

// ─────────────────────────────── Chứng nhận ───────────────────────────────

export const certificates = enrolments
  .filter((e) => e.status === 'completed')
  .map((e, i) => {
    const program = programs.find((p) => p.id === e.programId)
    return {
      id: `crt-${String(i + 1).padStart(3, '0')}`,
      code: `SA-2026-${String(1043 + i * 17).padStart(4, '0')}`,
      enrolmentId: e.id,
      learnerId: e.learnerId,
      learnerName: e.learnerName,
      programId: e.programId,
      programTitle: e.programTitle,
      issuedAt: e.completedAt,
      score: e.quizAvg,
      status: i % 11 === 3 ? 'revoked' : 'valid',
      signedBy: (programs.find((p) => p.id === e.programId) || {}).instructorId || 'ins-01',
      hasCertificate: program ? program.certificate : false,
      verifyUrl: `https://stretch.vn/verify/SA-2026-${String(1043 + i * 17).padStart(4, '0')}`,
    }
  })
  .filter((c) => c.hasCertificate)

// ─────────────────────────────── Đánh giá ───────────────────────────────

const REVIEW_TEXTS = [
  'Phần giải phẫu dễ theo hơn em tưởng, hình minh hoạ rõ ràng.',
  'Bài quiz cuối chương hơi ngắn, mong có thêm tình huống thực tế.',
  'Buổi thực hành ở studio đáng tiền, được sửa tay từng người.',
  'Video có chỗ tiếng nhỏ, còn nội dung thì rất chắc.',
  'Áp dụng ngay cho khách hôm sau, khách phản hồi tốt.',
  'Mong có bản ghi buổi hỏi đáp cho người học lệch giờ.',
  'Phiếu đánh giá in được là thứ em dùng nhiều nhất.',
  'Học xong tự tin nhận ca cổ vai, trước đây thì không.',
]

export const reviews = Array.from({ length: 18 }, (_, i) => {
  const enrolment = pick(rand, enrolments)
  const rating = weighted(rand, [[5, 6], [4, 4], [3, 2], [2, 1]])
  return {
    id: `rev-${String(i + 1).padStart(3, '0')}`,
    programId: enrolment.programId,
    programTitle: enrolment.programTitle,
    learnerId: enrolment.learnerId,
    learnerName: enrolment.learnerName,
    rating,
    text: pick(rand, REVIEW_TEXTS),
    createdAt: shiftStamp(-int(rand, 0, 90), int(rand, 8, 22), int(rand, 0, 59)),
    status: weighted(rand, [['approved', 6], ['pending', 3], ['hidden', 1]]),
    reply: rating <= 3 && i % 2 === 0 ? 'Cảm ơn bạn, bọn mình đã ghi nhận và sẽ thu lại phần âm thanh.' : '',
  }
})

// ─────────────────────── Video bài học (lesson media) ───────────────────────

const YT_IDS = [
  'g_tea8ZNk5A', 'sTANio_2E0Q', 'L_xrDAtykMI', 'nmXBOBaQu-c', 'Xk4x6Q9EJK0',
  '2L2lnxIcNmo', '4pKly2JojMw', 'qULTwquOuT4', 'ktdG_ONKAX8', 'FI51zRzgIe4',
]

export const lessonVideos = (() => {
  const rows = []
  for (const program of programs) {
    let ordinal = 0
    for (const [mIndex, module] of program.modules.entries()) {
      for (const [iIndex, item] of module.items.entries()) {
        if (item.type !== 'video') continue
        const missing = rand() < 0.12
        rows.push({
          id: `vid-${program.id}-${ordinal}`,
          programId: program.id,
          programTitle: program.title,
          moduleIndex: mIndex,
          moduleTitle: module.title,
          itemIndex: iIndex,
          ordinal,
          lessonTitle: item.title,
          minutes: item.minutes,
          // Seeded lessons are on YouTube; an R2 upload flips this to 'r2'.
          provider: 'youtube',
          youtubeId: missing ? '' : pick(rand, YT_IDS),
          videoId: '',
          objectKey: '',
          sizeBytes: 0,
          durationSeconds: null,
          visibility: 'unlisted',
          free: !!item.free,
          status: missing ? 'missing' : 'ready',
          note: missing ? 'Chưa gắn link — học viên sẽ thấy bài trống.' : '',
          updatedAt: shiftStamp(-int(rand, 1, 120), int(rand, 9, 19), int(rand, 0, 59)),
        })
        ordinal += 1
      }
    }
  }
  return rows
})()

// ─────────────────────── Phân tích học tập (insights) ───────────────────────

export const dropOff = programs
  .filter((p) => p.status === 'published' && p.lessons > 8)
  .slice(0, 6)
  .map((p) => {
    const points = []
    let remaining = 100
    for (let i = 0; i < Math.min(10, p.lessons); i += 1) {
      remaining -= int(rand, 1, i === 0 ? 6 : 11)
      points.push({ lesson: i + 1, retained: Math.max(18, remaining) })
    }
    const worst = points.reduce((acc, cur, idx) => {
      const prev = idx === 0 ? 100 : points[idx - 1].retained
      const drop = prev - cur.retained
      return drop > acc.drop ? { drop, lesson: cur.lesson } : acc
    }, { drop: 0, lesson: 1 })
    return {
      programId: p.id,
      programTitle: p.title,
      points,
      worstLesson: worst.lesson,
      worstDrop: worst.drop,
      completion: points[points.length - 1].retained,
    }
  })

export const quizMisses = Array.from({ length: 8 }, (_, i) => {
  const program = pick(rand, programs.filter((p) => p.status === 'published'))
  return {
    id: `qm-${i + 1}`,
    programId: program.id,
    programTitle: program.title,
    question: pick(rand, QUIZ_BANK).question,
    attempts: int(rand, 34, 287),
    missRate: int(rand, 31, 78),
  }
}).sort((a, b) => b.missRate - a.missRate)
