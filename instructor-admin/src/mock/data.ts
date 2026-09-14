/**
 * PLACEHOLDER DATA.
 *
 * Shaped exactly like the API responses the console expects, so swapping in real
 * endpoints touches `services/api.ts` and nothing else. Course slugs, titles and
 * prices match the public site's catalogue so the two can be compared side by
 * side while the real tables are being built.
 *
 * Numbers derived per-row use a stable hash of the row id, never Math.random() —
 * a dashboard whose figures shuffle on every reload cannot be trusted or tested.
 */
import type {
  Certificate,
  Course,
  CourseModule,
  CourseSession,
  Enrolment,
  Instructor,
  Learner,
  Lesson,
  LessonProgress,
  MediaAsset,
  QuizMissRow,
  Review,
} from '~/types'

function hash(seed: string): number {
  let h = 5381
  for (let i = 0; i < seed.length; i++) h = (h * 33 + seed.charCodeAt(i)) % 1000003
  return h
}

/** Deterministic integer in [min, max]. */
function pick(seed: string, min: number, max: number): number {
  return min + (hash(seed) % (max - min + 1))
}

export const instructors: Instructor[] = [
  {
    id: 'ins-1',
    name: 'Nguyễn Hải Đăng',
    role: 'Giảng viên Giải phẫu ứng dụng',
    bio: '12 năm làm việc với vận động viên và khách hàng phục hồi sau chấn thương.',
    initials: 'NĐ',
  },
  {
    id: 'ins-2',
    name: 'Phạm Minh Khoa',
    role: 'Trưởng nhóm Đánh giá vận động',
    bio: 'Xây dựng quy trình đánh giá đang dùng tại các cơ sở của Stretch.',
    initials: 'PK',
  },
  {
    id: 'ins-3',
    name: 'Lê Thanh Duy',
    role: 'Chuyên gia phục hồi thể thao',
    bio: 'Đồng hành cùng runner và vận động viên phong trào tại các giải marathon.',
    initials: 'LD',
  },
]

const LESSON_PATTERN: Array<Pick<Lesson, 'type' | 'title' | 'minutes'>> = [
  { type: 'video', title: 'Tổng quan phần này', minutes: 6 },
  { type: 'video', title: 'Cấu trúc & cơ chế', minutes: 12 },
  { type: 'video', title: 'Thực hành từng bước', minutes: 15 },
  { type: 'reading', title: 'Tài liệu & checklist', minutes: 8 },
  { type: 'video', title: 'Ca thực tế trên khách', minutes: 13 },
  { type: 'quiz', title: 'Kiểm tra nhanh', minutes: 5 },
]

function buildModules(slug: string, titles: [string, string][], perModule: number): CourseModule[] {
  return titles.map(([title, summary], mi) => ({
    id: `${slug}-m${mi}`,
    title,
    summary,
    lessons: Array.from({ length: perModule }, (_, li) => {
      const src = LESSON_PATTERN[li % LESSON_PATTERN.length]
      const id = `${slug}-m${mi}-l${li}`
      const lesson: Lesson = {
        id,
        type: src.type,
        title: src.title,
        minutes: src.minutes,
        free: mi === 0 && li === 0,
      }
      if (src.type === 'video') {
        lesson.videoKey = `courses/${slug}/${mi}-${li}.mp4`
      }
      if (src.type === 'reading') {
        lesson.body = `${summary} Phần đọc này tóm lại những điểm cần nhớ trước khi sang bài thực hành.`
      }
      if (src.type === 'quiz') {
        lesson.quiz = [
          {
            id: `${id}-q0`,
            question: `Phần “${title}” tập trung vào điều gì?`,
            options: [summary, 'Kỹ thuật xoa bóp thư giãn', 'Dinh dưỡng cho người tập gym', 'Đọc phim X-quang'],
            answer: 0,
          },
        ]
      }
      return lesson
    }),
  }))
}

export const courses: Course[] = [
  {
    id: 'c1',
    slug: 'giai-phau-van-dong-hoc-ung-dung',
    status: 'published',
    kind: 'course',
    mode: 'online',
    topic: 'anatomy',
    title: 'Giải phẫu & Vận động học ứng dụng',
    subtitle: 'Nắm chắc giải phẫu chức năng để lý giải được mọi cơn đau mỏi gặp trên sàn.',
    description:
      'Chương trình đi từ cấu trúc xương – khớp – cơ đến cách chúng phối hợp trong từng chuyển động thật, thay vì học thuộc tên cơ.',
    image: '/images/man-neck-pain.png',
    price: 1990000,
    level: 'Nâng cao — dành cho người đã hành nghề',
    skills: ['Giải phẫu chức năng', 'Cơ chế vận động', 'Sờ nắn định vị', 'Phân tích chuỗi động'],
    outcomes: [
      'Định vị chính xác nhóm cơ và mốc xương trên người thật',
      'Đọc được chuyển động bù trừ và truy về nguyên nhân',
      'Chọn kỹ thuật giãn phù hợp với từng cấu trúc',
    ],
    modules: buildModules('giai-phau-van-dong-hoc-ung-dung', [
      ['Nền tảng giải phẫu vận động', 'Mặt phẳng, trục, thuật ngữ và cách đọc một chuyển động.'],
      ['Cột sống & khung chậu', 'Đường cong sinh lý, nhóm cơ sâu và liên hệ với dáng đứng.'],
      ['Vai & chi trên', 'Phức hợp vai, xương bả và các kiểu hạn chế tầm vận động.'],
      ['Hông & chi dưới', 'Hông, gối, bàn chân và cách lực truyền qua chuỗi dưới.'],
    ], 6),
    faq: [
      { id: 'f1', q: 'Em chưa học y, theo được không?', a: 'Được. Phần nền tảng dạy lại toàn bộ thuật ngữ cần dùng.' },
      { id: 'f2', q: 'Em được truy cập bao lâu?', a: 'Trọn đời, gồm cả các bản cập nhật sau này.' },
    ],
    instructorId: 'ins-1',
    updatedAt: '2026-08-18',
    learnerCount: 148,
    avgProgress: 61,
    rating: 4.8,
  },
  {
    id: 'c2',
    slug: 'phan-tich-toi-uu-hieu-suat',
    status: 'published',
    kind: 'course',
    mode: 'online',
    topic: 'sports',
    title: 'Phân tích & Tối ưu hiệu suất',
    subtitle: 'Đưa người tập trở lại vận động sau chấn thương và giữ họ ở đó.',
    description: 'Chương trình bám theo dòng thời gian phục hồi thật, mỗi giai đoạn kèm tiêu chí chuyển tiếp rõ ràng.',
    image: '/runner-who.png',
    price: 1790000,
    level: 'Nâng cao — dành cho người đã hành nghề',
    skills: ['Quản lý tải tập', 'Lộ trình phục hồi', 'Tiêu chí trở lại vận động'],
    outcomes: ['Thiết kế lộ trình phục hồi 8–12 tuần', 'Chạy bộ test trước khi cho trở lại thi đấu'],
    modules: buildModules('phan-tich-toi-uu-hieu-suat', [
      ['Hiểu tổn thương & lành thương', 'Mô lành lại thế nào và điều đó giới hạn gì trong 6 tuần đầu.'],
      ['Tăng tải có kiểm soát', 'Nguyên tắc tăng tải và cách đọc phản ứng sau buổi tập.'],
      ['Trở lại vận động', 'Bộ test, tiêu chí đạt và cách trao đổi với người tập.'],
    ], 6),
    faq: [{ id: 'f3', q: 'Em đang đau, học để tự chữa được không?', a: 'Chương trình dành cho người hành nghề, không thay thế chẩn đoán.' }],
    instructorId: 'ins-3',
    updatedAt: '2026-08-14',
    learnerCount: 96,
    avgProgress: 44,
    rating: 4.7,
  },
  {
    id: 'c3',
    slug: 'hieu-ve-dau-khi-van-dong',
    status: 'published',
    kind: 'mini',
    mode: 'online',
    topic: 'anatomy',
    title: 'Hiểu về đau khi vận động',
    subtitle: 'Khóa ngắn miễn phí: vì sao đau, và khi nào cần dừng lại.',
    description: 'Năm bài ngắn giải thích cơ chế đau và cách trao đổi với khách hàng về nó.',
    image: '/education-class.png',
    price: 0,
    level: 'Cơ bản — không cần kiến thức nền',
    skills: ['Cơ chế đau', 'Giải thích cho khách hàng'],
    outcomes: ['Phân biệt đau cảnh báo và đau do thích nghi'],
    modules: buildModules('hieu-ve-dau-khi-van-dong', [
      ['Đau là tín hiệu gì', 'Đau không tỉ lệ thuận với mức tổn thương.'],
    ], 5),
    faq: [],
    instructorId: 'ins-1',
    updatedAt: '2026-08-20',
    learnerCount: 412,
    avgProgress: 73,
    rating: 4.9,
  },
  {
    id: 'c4',
    slug: 'danh-gia-van-dong-co-ban',
    status: 'published',
    kind: 'workshop',
    mode: 'offline',
    topic: 'assessment',
    title: 'Đánh giá vận động cơ bản',
    subtitle: 'Workshop một ngày: quan sát, test, ghi nhận và quyết định hướng xử lý.',
    description: 'Buổi thực hành trực tiếp theo cặp, giảng viên sửa từng người.',
    image: '/education-workshop.png',
    price: 490000,
    level: 'Trung cấp — cần nền tảng cơ bản',
    skills: ['Khai thác bệnh sử', 'Test tầm vận động', 'Sàng lọc cờ đỏ'],
    outcomes: ['Chạy được một buổi đánh giá đủ trong 20 phút'],
    modules: [],
    faq: [{ id: 'f4', q: 'Buổi thực hành cần mang gì?', a: 'Chỉ cần trang phục thoải mái để tập theo cặp.' }],
    instructorId: 'ins-2',
    updatedAt: '2026-08-11',
    learnerCount: 24,
    avgProgress: 100,
    rating: 4.9,
  },
  {
    id: 'c5',
    slug: 'van-dong-chuc-nang-cho-nguoi-van-phong',
    status: 'draft',
    kind: 'course',
    mode: 'online',
    topic: 'functional',
    title: 'Vận động chức năng cho người văn phòng',
    subtitle: 'Chương trình 10 phút mỗi ngày cho người ngồi 8 tiếng.',
    description: 'Tập trung vào phần khó nhất: làm cho người ta tập thật.',
    image: '/office-who.png',
    price: 890000,
    level: 'Trung cấp — cần nền tảng cơ bản',
    skills: ['Thiết kế chương trình', 'Tạo thói quen bền'],
    outcomes: ['Viết chương trình 10 phút/ngày cho người ngồi 8 tiếng'],
    modules: buildModules('van-dong-chuc-nang-cho-nguoi-van-phong', [
      ['Cơ thể của người ngồi nhiều', 'Ngồi lâu đổi gì và điều gì thực sự cần sửa.'],
      ['Bộ bài tập tại chỗ', 'Các bài làm được ngay tại bàn.'],
    ], 6),
    faq: [],
    instructorId: 'ins-1',
    updatedAt: '2026-08-21',
    learnerCount: 0,
    avgProgress: 0,
    rating: 0,
  },
]

const NAMES = [
  'Nguyễn Thu Hà', 'Trần Quốc Bảo', 'Lê Phương Anh', 'Đặng Minh Tuấn', 'Vũ Hoàng Yến',
  'Hồ Gia Khánh', 'Phạm Thanh Trúc', 'Bùi Đức Huy', 'Ngô Khánh Linh', 'Đỗ Nhật Nam',
  'Trịnh Mai Chi', 'Lý Quang Vinh',
]

export const learners: Learner[] = NAMES.map((name, i) => {
  const id = `l${i + 1}`
  const slug = name.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/g, 'd').split(' ').pop()
  return {
    id,
    name,
    email: `${slug}${i + 1}@gmail.com`,
    google: i % 3 !== 0,
    joinedAt: `2026-0${pick(id + 'j', 3, 8)}-${String(pick(id + 'd', 10, 28)).padStart(2, '0')}`,
    lastActiveAt: `2026-08-${String(pick(id + 'a', 6, 21)).padStart(2, '0')}`,
    note: i === 2 ? 'Chuyển khoản 18/08, đã cấp quyền tay.' : '',
  }
})

export const enrolments: Enrolment[] = learners.flatMap((learner, i) => {
  const targets = [courses[i % 3], courses[(i + 1) % 3]]
  return targets.map((course, k) => {
    const id = `e${learner.id}-${course.id}`
    const percent = pick(id, 5, 100)
    const done = percent === 100
    const lessons = course.modules.flatMap((m) => m.lessons)
    const at = Math.min(lessons.length - 1, Math.floor((percent / 100) * lessons.length))
    return {
      id,
      learnerId: learner.id,
      courseId: course.id,
      status: done ? 'completed' : 'active',
      source: course.price === 0 ? 'free' : k === 0 ? 'manual' : 'checkout',
      enrolledAt: `2026-0${pick(id + 's', 5, 8)}-${String(pick(id + 'x', 10, 27)).padStart(2, '0')}`,
      percent,
      lastLessonId: lessons[at]?.id ?? null,
    } satisfies Enrolment
  })
})

/**
 * Per-lesson watch records. `watchedSeconds` below the duration on a lesson with
 * no `completedAt` is exactly what the drop-off report reads.
 */
export const progress: LessonProgress[] = enrolments.flatMap((enrolment) => {
  const course = courses.find((c) => c.id === enrolment.courseId)
  if (!course) return []
  const lessons = course.modules.flatMap((m) => m.lessons)
  const reached = Math.ceil((enrolment.percent / 100) * lessons.length)
  return lessons.slice(0, reached).map((lesson, i) => {
    const duration = lesson.minutes * 60
    const last = i === reached - 1
    const seed = `${enrolment.id}-${lesson.id}`
    // The lesson they are on is partly watched; the ones behind it are finished.
    const watched = last ? Math.round(duration * (pick(seed, 15, 95) / 100)) : duration
    return {
      learnerId: enrolment.learnerId,
      courseId: course.id,
      lessonId: lesson.id,
      watchedSeconds: watched,
      durationSeconds: duration,
      completedAt: last ? null : `2026-08-${String(pick(seed + 'c', 5, 20)).padStart(2, '0')}`,
    }
  })
})

export const sessions: CourseSession[] = [
  {
    id: 's1', courseId: 'c4', courseTitle: 'Đánh giá vận động cơ bản',
    date: '2026-09-24', startTime: '08:30', endTime: '16:30',
    location: 'TP.HCM — Studio Q1', mode: 'offline', seatsTotal: 12,
    attendeeIds: ['l1', 'l3', 'l5', 'l7', 'l9', 'l11', 'l2', 'l4'],
  },
  {
    id: 's2', courseId: 'c2', courseTitle: 'Phân tích & Tối ưu hiệu suất',
    date: '2026-09-30', startTime: '19:30', endTime: '21:30',
    location: 'Trực tuyến — Google Meet', mode: 'online', seatsTotal: 40,
    attendeeIds: ['l2', 'l6', 'l8', 'l10', 'l12'],
  },
  {
    id: 's3', courseId: 'c4', courseTitle: 'Đánh giá vận động cơ bản',
    date: '2026-10-18', startTime: '08:30', endTime: '16:30',
    location: 'Hà Nội — Trung tâm Cầu Giấy', mode: 'offline', seatsTotal: 12,
    attendeeIds: ['l4', 'l8'],
  },
  {
    id: 's4', courseId: 'c1', courseTitle: 'Giải phẫu & Vận động học ứng dụng',
    date: '2026-08-14', startTime: '19:30', endTime: '21:30',
    location: 'Trực tuyến — Google Meet', mode: 'online', seatsTotal: 40,
    attendeeIds: ['l1', 'l2', 'l3', 'l5', 'l9'],
  },
]

export const certificates: Certificate[] = enrolments
  .filter((e) => e.status === 'completed')
  .map((e, i) => {
    const learner = learners.find((l) => l.id === e.learnerId)!
    const course = courses.find((c) => c.id === e.courseId)!
    return {
      id: `cert${i + 1}`,
      code: `${course.slug.slice(0, 3).toUpperCase()}-2026-${String(1000 + i).slice(1)}`,
      learnerId: learner.id,
      learnerName: learner.name,
      courseId: course.id,
      courseTitle: course.title,
      issuedAt: `2026-08-${String(pick(e.id + 'i', 2, 20)).padStart(2, '0')}`,
      revokedAt: null,
    }
  })

export const reviews: Review[] = [
  {
    id: 'r1', learnerId: 'l1', learnerName: 'Nguyễn Thu Hà', courseId: 'c1',
    courseTitle: 'Giải phẫu & Vận động học ứng dụng', rating: 5,
    text: 'Phần thực hành đúng cái em cần. Sau khóa em áp dụng ngay được cho khách và giải thích rõ ràng hơn hẳn.',
    status: 'pending', createdAt: '2026-08-19',
  },
  {
    id: 'r2', learnerId: 'l4', learnerName: 'Đặng Minh Tuấn', courseId: 'c1',
    courseTitle: 'Giải phẫu & Vận động học ứng dụng', rating: 4,
    text: 'Kiến thức tốt, mong có thêm ví dụ cho người mới. Dù vậy vẫn đáng so với chi phí.',
    status: 'approved', createdAt: '2026-08-12',
  },
  {
    id: 'r3', learnerId: 'l6', learnerName: 'Hồ Gia Khánh', courseId: 'c2',
    courseTitle: 'Phân tích & Tối ưu hiệu suất', rating: 5,
    text: 'Mẫu chương trình theo tuần dùng lại được ngay, khỏi phải viết từ đầu.',
    status: 'pending', createdAt: '2026-08-20',
  },
  {
    id: 'r4', learnerId: 'l9', learnerName: 'Ngô Khánh Linh', courseId: 'c3',
    courseTitle: 'Hiểu về đau khi vận động', rating: 2,
    text: 'Khóa hay nhưng video bài 3 bị mất tiếng ở đoạn giữa, em phải tự đoán.',
    status: 'pending', createdAt: '2026-08-21',
  },
  {
    id: 'r5', learnerId: 'l11', learnerName: 'Trịnh Mai Chi', courseId: 'c3',
    courseTitle: 'Hiểu về đau khi vận động', rating: 5,
    text: 'Ngắn, gọn, xem một buổi trưa là hết. Rất phù hợp người mới.',
    status: 'approved', createdAt: '2026-08-08',
  },
]

export const media: MediaAsset[] = courses
  .flatMap((c) => c.modules.flatMap((m) => m.lessons.filter((l) => l.videoKey).map((l) => ({ c, l }))))
  .slice(0, 14)
  .map(({ c, l }, i) => {
    const duration = l.minutes * 60
    // A couple of rows are deliberately over-bitrate so the warning has something
    // real to fire on.
    const heavy = i % 5 === 0
    const bitrateKbps = heavy ? pick(l.id + 'b', 9000, 16000) : pick(l.id + 'b', 900, 3200)
    return {
      id: `md${i + 1}`,
      key: l.videoKey!,
      courseId: c.id,
      lessonId: l.id,
      sizeBytes: Math.round((bitrateKbps * 1000 * duration) / 8),
      durationSeconds: duration,
      width: heavy ? 1920 : 1280,
      height: heavy ? 1080 : 720,
      uploadedAt: `2026-08-${String(pick(l.id + 'u', 2, 20)).padStart(2, '0')}`,
      posterKey: i % 4 === 0 ? null : l.videoKey!.replace(/\.mp4$/, '.jpg'),
    }
  })

export const quizMisses: QuizMissRow[] = courses
  .flatMap((c) => c.modules.flatMap((m) => m.lessons.filter((l) => l.quiz?.length).map((l) => ({ c, m, l }))))
  .slice(0, 8)
  .map(({ c, m, l }) => ({
    questionId: l.quiz![0].id,
    courseTitle: c.title,
    lessonTitle: `${m.title} · ${l.title}`,
    question: l.quiz![0].question,
    attempts: pick(l.id + 'at', 24, 180),
    missRate: pick(l.id + 'ms', 8, 71),
  }))
  .sort((a, b) => b.missRate - a.missRate)
