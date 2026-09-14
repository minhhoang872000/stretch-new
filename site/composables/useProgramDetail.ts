import type { Ref } from 'vue'
/**
 * Course / workshop detail — everything the catalogue card does not carry.
 *
 * PLACEHOLDER DATA — same arrangement as `useLearningCatalog`: bilingual text
 * lives inline instead of in i18n/locales, which would otherwise need a key per
 * syllabus line. Swap `detailFor()` for a `$fetch('/api/programs/' + slug)`
 * once the courses API exists and keep the returned shape.
 *
 * Detail is BUILT from the catalogue record plus a per-topic template rather
 * than hand-written sixteen times: the shape (a syllabus, an instructor, a
 * rating, an FAQ) is what the page has to be designed against, and a template
 * keeps every slug renderable instead of leaving most of them on an empty page.
 * Anything derived from the slug uses a stable hash, never `Math.random()`, so
 * the server render and the client hydration agree on the same numbers.
 *
 * Instructor and reviewer names here are INVENTED. Replace them along with the
 * real API — they must not ship as if they were real people.
 */
import type { CatalogProgram, ProgramTopic } from '~/composables/useLearningCatalog'

export type LessonType = 'video' | 'reading' | 'quiz'

export interface SyllabusItem {
  type: LessonType
  title: string
  minutes: number
  /** Free preview — playable before enrolling. */
  free?: boolean
  /**
   * The lesson video, as a YouTube link. Any form is accepted (watch URL,
   * youtu.be short link, embed URL, or a bare id) — the player parses it.
   * Empty on a lesson whose video is not published yet.
   */
  youtube?: string
  /** True when the link came from the demo pool, not from Stretch's own uploads. */
  youtubeDemo?: boolean
}

export interface SyllabusModule {
  title: string
  summary: string
  items: SyllabusItem[]
  minutes: number
}

/** Scheduled items (a date + a place) get an hour-by-hour agenda, not a syllabus. */
export interface AgendaSlot {
  time: string
  title: string
  note?: string
}

export interface Instructor {
  name: string
  initials: string
  role: string
  bio: string
  courses: number
  learners: number
}

export interface CourseReview {
  name: string
  initials: string
  rating: number
  date: string
  text: string
}

export interface FaqItem {
  q: string
  a: string
}

export interface ProgramDetail {
  program: CatalogProgram
  /** Scheduled = workshop-style: agenda + seats instead of syllabus + lessons. */
  scheduled: boolean
  subtitle: string
  description: string[]
  level: string
  language: string
  certificate: boolean
  skills: string[]
  outcomes: string[]
  modules: SyllabusModule[]
  agenda: AgendaSlot[]
  includes: string[]
  instructor: Instructor
  /** `distribution` is percentages, 5★ first. */
  rating: { avg: number; count: number; distribution: number[] }
  reviews: CourseReview[]
  faq: FaqItem[]
  enrolled: number
  seatsLeft: number
  related: CatalogProgram[]
  totalMinutes: number
}

/**
 * Lesson videos, per course, in lesson order — the YouTube links for the video
 * lessons of that course (first entry = first video lesson, and so on).
 *
 * ⚠️ THE ONE PLACE TO PASTE LINKS. Nothing else needs touching: any YouTube form
 * works (`https://www.youtube.com/watch?v=…`, `https://youtu.be/…`, an embed URL,
 * or a bare id). A course listed here uses exactly these links, in order; a
 * course that is not listed falls back to the demo pool below.
 *
 * Example:
 *   'giai-phau-van-dong-hoc-ung-dung': [
 *     'https://www.youtube.com/watch?v=XXXXXXXXXXX',
 *     'https://youtu.be/YYYYYYYYYYY',
 *   ],
 */
const LESSON_VIDEOS: Record<string, string[]> = {}

/**
 * DEMO VIDEOS — NOT STRETCH'S OWN CONTENT.
 *
 * Public Vietnamese stretching/mobility videos from other channels, grouped by
 * topic and cycled across a course's video lessons so every lesson in the player
 * plays something on-topic. Each id was checked against YouTube's oEmbed
 * endpoint on 2026-08-20: the video exists and its uploader allows embedding.
 *
 * A lesson filled from this pool is flagged `youtubeDemo`, and the player prints
 * "video minh hoạ" under it — so this can never quietly pass for Stretch's own
 * teaching. Replace it by adding the real uploads to LESSON_VIDEOS above.
 * (Stretch's channel is youtube.com/@Stretchvn; its video ids are not readable
 * from the channel page without a browser, so they have to be pasted by hand.)
 */
const TOPIC_DEMO_VIDEOS: Record<ProgramTopic, string[]> = {
  // Hướng dẫn stretching cho người mới · 7 động tác mỗi ngày · dynamic stretching
  anatomy: ['gXKA_PiaTa8', '6ARC-2_ha8Y', 'USuTyTUzSbY'],
  // Tư thế ngồi & cột sống · trị liệu vai cổ gáy · kỹ thuật giãn cơ
  assessment: ['px7P-xHijaU', 'e4qZY6ubgZE', 'gXKA_PiaTa8'],
  // Giãn cơ sau tập · giãn cơ mông–chân–lưng · giãn cơ thân dưới
  sports: ['xavAmq9BFJ0', '8UBxTMpZHLE', 'E7bryOytfR4'],
  // Bài tập tại ghế · bài tập giảm mỏi tại chỗ · trị liệu vai cổ gáy
  functional: ['dUcJVqlo0HE', '5mrdUnijO44', 'e4qZY6ubgZE'],
}

/** djb2-ish. Same slug → same numbers on server and client. */
function hashOf(slug: string): number {
  let h = 5381
  for (let i = 0; i < slug.length; i++) h = (h * 33 + slug.charCodeAt(i)) % 1000003
  return h
}

function initialsOf(name: string): string {
  const parts = name.replace(/(ThS\.|BS\.|Dr\.|MSc|PT|CSCS|,)/gi, ' ').trim().split(/\s+/).filter(Boolean)
  if (!parts.length) return '?'
  const letters = parts.length === 1
    ? parts[0].slice(0, 1)
    : parts[0].slice(0, 1) + parts[parts.length - 1].slice(0, 1)
  return letters.toUpperCase()
}

export function useProgramDetail() {
  const { programs } = useLearningCatalog()

  // The Learning Hub ships in Vietnamese only (2026-08): its audience is local
  // practitioners, and half-translated course copy reads worse than none. The
  // English strings below stay as `pick()`'s second argument — restoring the
  // translation means restoring the locale check here, nothing else.
  const pick = (viText: string, _enText: string) => viText

  /** One lesson-row template, cycled through each module. */
  const itemPattern = computed<Omit<SyllabusItem, 'free'>[]>(() => [
    { type: 'video', title: pick('Tổng quan phần này', 'What this part covers'), minutes: 6 },
    { type: 'video', title: pick('Cấu trúc & cơ chế', 'Structure & mechanism'), minutes: 12 },
    { type: 'video', title: pick('Thực hành từng bước', 'Step-by-step practice'), minutes: 15 },
    { type: 'reading', title: pick('Tài liệu & checklist', 'Notes & checklist'), minutes: 8 },
    { type: 'video', title: pick('Ca thực tế trên khách', 'A real client, start to finish'), minutes: 13 },
    { type: 'video', title: pick('Lỗi thường gặp', 'Common mistakes'), minutes: 9 },
    { type: 'reading', title: pick('Bài tập về nhà', 'Practice homework'), minutes: 7 },
    { type: 'quiz', title: pick('Kiểm tra nhanh', 'Quick check'), minutes: 5 },
  ])

  const templates = computed(() => ({
    anatomy: {
      subtitle: pick(
        'Nắm chắc giải phẫu chức năng và cơ chế vận động để lý giải được mọi cơn đau mỏi bạn gặp trên sàn.',
        'Master functional anatomy and movement mechanics so you can explain every ache you meet on the floor.',
      ),
      description: [
        pick(
          'Chương trình đi từ cấu trúc xương – khớp – cơ đến cách chúng phối hợp trong từng chuyển động thật, thay vì học thuộc tên cơ. Mỗi phần đều kết thúc bằng một ca thực tế để kiến thức chạy được vào tay bạn.',
          'The programme moves from bone, joint and muscle structure to how they cooperate in real movement, instead of memorising muscle names. Every part closes on a real case so the knowledge reaches your hands.',
        ),
        pick(
          'Phù hợp cho stretch therapist, PT và huấn luyện viên cá nhân muốn tự tin giải thích cho khách vì sao họ đau và bước tiếp theo nên làm gì.',
          'Built for stretch therapists, PTs and personal trainers who want to tell a client confidently why it hurts and what comes next.',
        ),
      ],
      skills: [
        pick('Giải phẫu chức năng', 'Functional anatomy'),
        pick('Cơ chế vận động', 'Movement mechanics'),
        pick('Sờ nắn định vị', 'Palpation & landmarks'),
        pick('Phân tích chuỗi động', 'Kinetic chain analysis'),
        pick('Giải thích cho khách hàng', 'Explaining it to clients'),
      ],
      outcomes: [
        pick('Định vị chính xác nhóm cơ và mốc xương trên người thật', 'Locate muscle groups and bony landmarks on a real body'),
        pick('Đọc được chuyển động bù trừ và truy về nguyên nhân', 'Read compensations and trace them back to a cause'),
        pick('Chọn kỹ thuật giãn phù hợp với từng cấu trúc', 'Match a stretching technique to the structure involved'),
        pick('Diễn đạt vấn đề bằng ngôn ngữ khách hàng hiểu được', 'Describe the problem in words a client understands'),
      ],
      modules: [
        [pick('Nền tảng giải phẫu vận động', 'Foundations of movement anatomy'), pick('Mặt phẳng, trục, thuật ngữ và cách đọc một chuyển động.', 'Planes, axes, terminology, and how to read a movement.')],
        [pick('Cột sống & khung chậu', 'Spine & pelvis'), pick('Đường cong sinh lý, nhóm cơ sâu và liên hệ với dáng đứng.', 'Natural curves, the deep muscles, and the link to posture.')],
        [pick('Vai & chi trên', 'Shoulder & upper limb'), pick('Phức hợp vai, xương bả và các kiểu hạn chế tầm vận động.', 'The shoulder complex, the scapula, and common range limits.')],
        [pick('Hông & chi dưới', 'Hip & lower limb'), pick('Hông, gối, bàn chân và cách lực truyền qua chuỗi dưới.', 'Hip, knee, foot, and how load travels down the chain.')],
        [pick('Chuỗi động & bù trừ', 'Kinetic chains & compensation'), pick('Vì sao đau ở một nơi lại bắt nguồn từ một nơi khác.', 'Why pain in one place starts somewhere else.')],
        [pick('Ứng dụng vào ca thật', 'Putting it on a real case'), pick('Ba ca mẫu, từ quan sát ban đầu đến kế hoạch xử lý.', 'Three sample cases, from first look to a plan.')],
      ],
      instructor: {
        name: pick('ThS. Nguyễn Hải Đăng', 'Dang Nguyen, MSc'),
        role: pick('Giảng viên Giải phẫu ứng dụng · Stretch Academy', 'Applied Anatomy Lead · Stretch Academy'),
        bio: pick(
          '12 năm làm việc với vận động viên và khách hàng phục hồi sau chấn thương, phụ trách nội dung giải phẫu của toàn bộ chương trình đào tạo tại Stretch.',
          '12 years with athletes and post-injury clients; owns the anatomy curriculum across every Stretch training programme.',
        ),
      },
      faq: [
        pick('Em chưa học y, theo được không?', 'I have no medical background — can I follow this?'),
        pick('Được. Phần nền tảng dạy lại toàn bộ thuật ngữ cần dùng trước khi vào chi tiết, không yêu cầu kiến thức y khoa trước đó.', 'Yes. The foundations part teaches every term you need before going deeper — no prior medical study required.'),
      ],
    },
    assessment: {
      subtitle: pick(
        'Quy trình đánh giá vận động từ đầu đến cuối: quan sát, test, ghi nhận và quyết định hướng xử lý.',
        'A start-to-finish movement assessment routine: observe, test, record, decide.',
      ),
      description: [
        pick(
          'Bạn sẽ có một bộ quy trình đánh giá dùng được ngay trong buổi làm việc kế tiếp: hỏi gì trước, quan sát ở góc nào, chạy test nào, và đọc kết quả ra sao để không phải đoán.',
          'You leave with an assessment routine usable in your very next session: what to ask first, where to stand, which tests to run, and how to read them instead of guessing.',
        ),
        pick(
          'Toàn bộ test trong chương trình đều làm được mà không cần thiết bị chuyên dụng — chỉ cần một tấm thảm và đôi mắt được huấn luyện.',
          'Every test here works without special equipment — a mat and a trained eye are enough.',
        ),
      ],
      skills: [
        pick('Khai thác bệnh sử', 'Intake interview'),
        pick('Quan sát dáng & tư thế', 'Posture & gait observation'),
        pick('Test tầm vận động', 'Range-of-motion testing'),
        pick('Sàng lọc cờ đỏ', 'Red-flag screening'),
        pick('Ghi chép & theo dõi tiến độ', 'Charting & progress tracking'),
      ],
      outcomes: [
        pick('Chạy được một buổi đánh giá đủ trong 20 phút', 'Run a complete assessment in 20 minutes'),
        pick('Phân biệt hạn chế do cơ, do khớp hay do kiểm soát', 'Tell a muscular, joint or control limitation apart'),
        pick('Nhận ra dấu hiệu cần chuyển khách sang bác sĩ', 'Recognise the signs that need a doctor, not you'),
        pick('Lập hồ sơ theo dõi để đo tiến bộ theo tuần', 'Keep a record that shows week-by-week progress'),
      ],
      modules: [
        [pick('Bắt đầu một buổi đánh giá', 'Starting an assessment'), pick('Khai thác thông tin, đặt câu hỏi đúng và tạo an tâm cho khách.', 'Intake, asking the right questions, putting the client at ease.')],
        [pick('Quan sát tĩnh', 'Static observation'), pick('Đọc tư thế đứng, ngồi và những gì tư thế đó nói ra.', 'Reading standing and seated posture, and what it tells you.')],
        [pick('Quan sát động', 'Dynamic observation'), pick('Squat, bước, với tay — các mẫu vận động cơ bản.', 'Squat, step, reach — the basic movement patterns.')],
        [pick('Bộ test tầm vận động', 'The range-of-motion battery'), pick('Test theo vùng, cách đo và cách ghi lại số liệu.', 'Region-by-region tests, how to measure and how to log it.')],
        [pick('Cờ đỏ & giới hạn nghề', 'Red flags & scope of practice'), pick('Khi nào dừng lại và giới thiệu khách sang chuyên khoa.', 'When to stop and refer out instead of treating.')],
        [pick('Từ kết quả đến kế hoạch', 'From findings to a plan'), pick('Sắp xếp ưu tiên và viết kế hoạch cho 4 tuần đầu.', 'Prioritising, and writing the first four weeks.')],
      ],
      instructor: {
        name: pick('Phạm Minh Khoa, PT', 'Khoa Pham, PT'),
        role: pick('Trưởng nhóm Đánh giá vận động · Stretch', 'Head of Movement Assessment · Stretch'),
        bio: pick(
          'Xây dựng quy trình đánh giá đang dùng tại các cơ sở của Stretch, đã trực tiếp đánh giá hơn 4.000 khách hàng.',
          'Built the assessment routine used across Stretch locations; has personally assessed more than 4,000 clients.',
        ),
      },
      faq: [
        pick('Buổi thực hành có cần mang theo gì không?', 'Do I need to bring anything to the practical?'),
        pick('Chỉ cần trang phục thoải mái để tập theo cặp. Thảm, tài liệu in và dụng cụ đo do Stretch chuẩn bị.', 'Just comfortable clothes for paired practice. Mats, printed material and measuring tools are provided.'),
      ],
    },
    sports: {
      subtitle: pick(
        'Đưa người tập trở lại vận động sau chấn thương và giữ họ ở đó — an toàn, có lộ trình, đo được.',
        'Get people back to sport after injury and keep them there — safely, on a plan you can measure.',
      ),
      description: [
        pick(
          'Chương trình bám theo dòng thời gian phục hồi thật: giảm đau, lấy lại tầm vận động, tăng tải, rồi trở lại thi đấu — mỗi giai đoạn kèm tiêu chí rõ ràng để biết khi nào được chuyển tiếp.',
          'The programme follows a real rehab timeline: settle the pain, restore range, build load, return to sport — each stage with clear criteria for moving on.',
        ),
        pick(
          'Có sẵn mẫu chương trình tập theo tuần để bạn chỉnh lại theo từng khách thay vì viết từ con số không.',
          'It includes week-by-week programme templates you adapt per client instead of writing from scratch.',
        ),
      ],
      skills: [
        pick('Quản lý tải tập', 'Load management'),
        pick('Lộ trình phục hồi theo giai đoạn', 'Staged rehab planning'),
        pick('Tiêu chí trở lại vận động', 'Return-to-play criteria'),
        pick('Phòng ngừa tái phát', 'Re-injury prevention'),
        pick('Theo dõi hiệu suất', 'Performance monitoring'),
      ],
      outcomes: [
        pick('Thiết kế lộ trình phục hồi 8–12 tuần có tiêu chí chuyển giai đoạn', 'Design an 8–12 week rehab path with progression criteria'),
        pick('Điều chỉnh tải khi khách đau tăng hoặc tiến bộ nhanh', 'Adjust load when pain flares or progress runs ahead'),
        pick('Chạy bộ test trước khi cho trở lại thi đấu', 'Run a return-to-play test battery'),
        pick('Xây bài phòng ngừa gắn vào phần khởi động sẵn có', 'Build prevention work into an existing warm-up'),
      ],
      modules: [
        [pick('Hiểu tổn thương & lành thương', 'Injury & healing'), pick('Mô lành lại thế nào và điều đó giới hạn gì trong 6 tuần đầu.', 'How tissue heals, and what that limits in the first six weeks.')],
        [pick('Giai đoạn giảm đau', 'Settling the pain'), pick('Xử lý giai đoạn cấp mà không để mất tầm vận động.', 'Handling the acute phase without losing range.')],
        [pick('Lấy lại tầm & kiểm soát', 'Restoring range & control'), pick('Giãn, kích hoạt và tái lập kiểm soát vận động.', 'Stretch, activate, and rebuild motor control.')],
        [pick('Tăng tải có kiểm soát', 'Building load'), pick('Nguyên tắc tăng tải và cách đọc phản ứng sau buổi tập.', 'Progression rules, and reading the day-after response.')],
        [pick('Trở lại vận động', 'Return to sport'), pick('Bộ test, tiêu chí đạt và cách trao đổi với người tập.', 'The test battery, the pass criteria, and the conversation.')],
        [pick('Giữ phong độ & phòng tái phát', 'Staying healthy'), pick('Bài duy trì và dấu hiệu sớm của tái phát.', 'Maintenance work, and the early signs of a relapse.')],
      ],
      instructor: {
        name: pick('Lê Thanh Duy, CSCS', 'Duy Le, CSCS'),
        role: pick('Chuyên gia phục hồi thể thao · Stretch', 'Sports Rehab Specialist · Stretch'),
        bio: pick(
          'Đồng hành cùng runner và vận động viên phong trào tại các giải marathon, pickleball và tennis; phụ trách nhóm nội dung phục hồi thể thao.',
          'Works with runners and amateur athletes across marathon, pickleball and tennis events; leads the sports rehab content team.',
        ),
      },
      faq: [
        pick('Em đang đau, học khóa này để tự chữa được không?', 'I am in pain — can I use this to treat myself?'),
        pick('Chương trình dành cho người hành nghề và không thay thế chẩn đoán. Nếu đang đau, anh/chị nên được thăm khám trực tiếp trước.', 'This is written for practitioners and does not replace a diagnosis. If you are in pain, get assessed in person first.'),
      ],
    },
    functional: {
      subtitle: pick(
        'Thiết kế chương trình vận động chức năng gọn, dễ theo, dành cho người ngồi nhiều và ít thời gian.',
        'Design short, easy-to-follow functional movement programmes for people who sit a lot and have little time.',
      ),
      description: [
        pick(
          'Chương trình tập trung vào phần khó nhất: làm cho người ta tập thật. Bạn sẽ học cách rút một chương trình xuống còn 10 phút mà vẫn tạo được thay đổi, và cách gắn nó vào ngày làm việc của khách.',
          'This one focuses on the hard part: getting people to actually do it. You will learn to cut a programme down to ten minutes that still changes something, and to fit it into a client’s working day.',
        ),
        pick(
          'Dùng được cho cả khách cá nhân và các chương trình wellness tại doanh nghiệp.',
          'It works for one-on-one clients and for corporate wellness programmes alike.',
        ),
      ],
      skills: [
        pick('Thiết kế chương trình', 'Programme design'),
        pick('Hơi thở & kiểm soát trung tâm', 'Breathing & core control'),
        pick('Vận động tại chỗ làm việc', 'Desk-side movement'),
        pick('Tạo thói quen bền', 'Habit building'),
        pick('Hướng dẫn nhóm', 'Coaching a group'),
      ],
      outcomes: [
        pick('Viết chương trình 10 phút mỗi ngày cho người ngồi 8 tiếng', 'Write a 10-minute daily plan for someone who sits eight hours'),
        pick('Sửa các lỗi tư thế phổ biến bằng bài tập đơn giản', 'Fix common posture faults with simple drills'),
        pick('Dẫn một buổi vận động nhóm 20 người', 'Lead a 20-person group movement session'),
        pick('Thiết kế cách nhắc và theo dõi để khách không bỏ giữa đường', 'Build the reminders and tracking that stop people quitting'),
      ],
      modules: [
        [pick('Cơ thể của người ngồi nhiều', 'The body of a desk worker'), pick('Ngồi lâu đổi gì trong cơ thể và điều gì thực sự cần sửa.', 'What long sitting changes, and what actually needs fixing.')],
        [pick('Thở & trung tâm', 'Breathing & centre'), pick('Hơi thở, cơ hoành và kiểm soát trung tâm nền tảng.', 'Breath, diaphragm, and baseline core control.')],
        [pick('Bộ bài tập tại chỗ', 'The desk-side set'), pick('Các bài làm được ngay tại bàn, không cần đổi trang phục.', 'Drills that work at the desk, no change of clothes needed.')],
        [pick('Chương trình 10 phút', 'The ten-minute programme'), pick('Cách chọn 5 bài đúng và sắp thứ tự cho hiệu quả nhất.', 'Choosing the right five drills, and ordering them well.')],
        [pick('Duy trì & tạo thói quen', 'Habit & adherence'), pick('Nhắc, đo và ăn mừng tiến bộ nhỏ để khách đi đường dài.', 'Reminding, measuring, and celebrating small wins.')],
        [pick('Triển khai cho doanh nghiệp', 'Rolling it out at a company'), pick('Đưa chương trình vào một tổ chức 50–500 người.', 'Taking the programme into a 50–500 person organisation.')],
      ],
      instructor: {
        name: pick('Trần Ngọc Mai, PT', 'Mai Tran, PT'),
        role: pick('Phụ trách Wellness doanh nghiệp · Stretch', 'Corporate Wellness Lead · Stretch'),
        bio: pick(
          'Triển khai chương trình vận động tại hơn 60 doanh nghiệp ở TP.HCM và Hà Nội, tập trung vào những chương trình mà nhân viên chịu làm đều mỗi ngày.',
          'Has rolled movement programmes into 60+ companies in Ho Chi Minh City and Hanoi, focused on plans employees actually keep doing.',
        ),
      },
      faq: [
        pick('Khóa này có phù hợp với người không làm nghề không?', 'Is this useful if I am not a practitioner?'),
        pick('Có. Nhiều học viên là nhân viên văn phòng, học để tự chăm cho mình và cho đồng nghiệp trong nhóm.', 'Yes. Many learners are office workers taking it for themselves and their team.'),
      ],
    },
  }))

  /** Reviewer voices are shared across programmes — three are picked per slug. */
  const reviewPool = computed<Omit<CourseReview, 'initials'>[]>(() => [
    {
      name: pick('Nguyễn Thu Hà', 'Ha Nguyen'), rating: 5, date: pick('12/07/2026', '12 Jul 2026'),
      text: pick('Phần thực hành đúng cái em cần. Sau khóa em áp dụng ngay được cho khách và giải thích rõ ràng hơn hẳn.', 'The practical part was exactly what I needed. I used it with clients the next week and explained things far better.'),
    },
    {
      name: pick('Trần Quốc Bảo', 'Bao Tran'), rating: 5, date: pick('28/06/2026', '28 Jun 2026'),
      text: pick('Nội dung sắp xếp mạch lạc, không lan man. Giảng viên trả lời câu hỏi rất kỹ trong phần hỏi đáp.', 'Well sequenced, nothing padded. The instructor answered questions thoroughly in the Q&A.'),
    },
    {
      name: pick('Lê Phương Anh', 'Anh Le'), rating: 4, date: pick('05/06/2026', '5 Jun 2026'),
      text: pick('Kiến thức tốt, em mong có thêm ví dụ cho người mới. Dù vậy vẫn rất đáng so với chi phí.', 'Solid material; I would like a few more beginner examples. Still well worth the price.'),
    },
    {
      name: pick('Đặng Minh Tuấn', 'Tuan Dang'), rating: 5, date: pick('21/05/2026', '21 May 2026'),
      text: pick('Học xong em tự tin hơn nhiều khi làm việc với khách lớn tuổi. Tài liệu kèm theo dùng lại được dài lâu.', 'I am much more confident with older clients now. The handouts stay useful long after.'),
    },
    {
      name: pick('Vũ Hoàng Yến', 'Yen Vu'), rating: 5, date: pick('09/05/2026', '9 May 2026'),
      text: pick('Cách dạy đi thẳng vào việc làm được, không nặng lý thuyết. Nhóm nhỏ nên ai cũng được sửa từng người.', 'Very hands-on, not theory-heavy. The group was small enough that everyone got corrected.'),
    },
    {
      name: pick('Hồ Gia Khánh', 'Khanh Ho'), rating: 4, date: pick('26/04/2026', '26 Apr 2026'),
      text: pick('Chất lượng ổn định. Em chỉ mong phần bài tập về nhà có thêm hướng dẫn chấm điểm.', 'Consistently good. I only wish the homework came with a marking guide.'),
    },
  ])

  /** FAQ shared by every programme; the topic template adds one of its own. */
  const baseFaq = computed<FaqItem[]>(() => [
    {
      q: pick('Thanh toán và hoàn tiền thế nào?', 'How do payment and refunds work?'),
      a: pick('Thanh toán bằng thẻ hoặc chuyển khoản. Trong 7 ngày đầu, nếu chương trình không phù hợp, anh/chị được hoàn 100% và không cần giải thích lý do.', 'Card or bank transfer. Within the first seven days, if the programme is not right for you, you get a full refund — no reason required.'),
    },
    {
      q: pick('Em được truy cập nội dung trong bao lâu?', 'How long do I keep access?'),
      a: pick('Trọn đời với phần nội dung online, gồm cả các bản cập nhật sau này của cùng khóa học.', 'Lifetime for the online material, including future updates to the same course.'),
    },
    {
      q: pick('Chứng nhận có được công nhận không?', 'Is the certificate recognised?'),
      a: pick('Chứng nhận do Stretch Academy cấp, có mã tra cứu và chia sẻ được lên LinkedIn. Đây không phải chứng chỉ hành nghề do cơ quan nhà nước cấp.', 'It is issued by Stretch Academy with a verification code and can be shared to LinkedIn. It is not a state-issued practising licence.'),
    },
    {
      q: pick('Em học trên điện thoại được không?', 'Can I learn on my phone?'),
      a: pick('Được. Toàn bộ video và tài liệu đều xem được trên điện thoại, tiến độ học lưu đồng bộ theo tài khoản.', 'Yes. Every video and handout works on mobile, and your progress syncs to your account.'),
    },
  ])

  function buildModules(program: CatalogProgram, topic: ProgramTopic): SyllabusModule[] {
    const tpl = templates.value[topic]
    const lessons = Math.max(2, program.lessons ?? 12)
    const count = Math.min(tpl.modules.length, Math.max(2, Math.ceil(lessons / 7)))
    const base = Math.floor(lessons / count)
    const extra = lessons % count
    const pattern = itemPattern.value

    // Videos are handed out in lesson order across the whole course, not per
    // module, so the list in LESSON_VIDEOS reads the way a playlist does. Real
    // links run out at the end of the list; demo links cycle, because a course
    // has more video lessons than the pool has videos.
    const real = LESSON_VIDEOS[program.slug]
    const videos = real ?? TOPIC_DEMO_VIDEOS[topic] ?? []
    const isDemo = !real
    let videoSeen = 0

    return tpl.modules.slice(0, count).map(([title, summary], mi) => {
      const size = base + (mi < extra ? 1 : 0)
      const items: SyllabusItem[] = Array.from({ length: size }, (_, ii) => {
        const src = pattern[ii % pattern.length]
        const item: SyllabusItem = { ...src }
        if (item.type === 'video' && videos.length) {
          const index = videoSeen++
          const link = isDemo ? videos[index % videos.length] : videos[index]
          if (link) {
            item.youtube = link
            if (isDemo) item.youtubeDemo = true
          }
        }
        // One free preview per programme — the opening lesson.
        if (mi === 0 && ii === 0) item.free = true
        return item
      })
      return { title, summary, items, minutes: items.reduce((sum, item) => sum + item.minutes, 0) }
    })
  }

  function buildAgenda(topic: ProgramTopic): AgendaSlot[] {
    const mods = templates.value[topic].modules
    return [
      { time: '08:30', title: pick('Nhận chỗ & chào hỏi', 'Check-in & welcome'), note: pick('Nhận tài liệu, chia nhóm thực hành theo cặp.', 'Handouts, and pairing up for practice.') },
      { time: '09:00', title: mods[1][0], note: mods[1][1] },
      { time: '10:15', title: pick('Nghỉ giữa buổi', 'Coffee break') },
      { time: '10:30', title: pick('Thực hành: ', 'Practical: ') + mods[2][0], note: mods[2][1] },
      { time: '12:00', title: pick('Nghỉ trưa', 'Lunch break') },
      { time: '13:00', title: pick('Thực hành theo cặp', 'Paired practice'), note: pick('Giảng viên đi từng cặp để sửa trực tiếp.', 'The instructor moves pair to pair, correcting as you go.') },
      { time: '15:00', title: mods[4][0], note: mods[4][1] },
      { time: '16:15', title: pick('Hỏi đáp & tổng kết', 'Q&A and wrap-up'), note: pick('Nhận chứng nhận tham dự và lộ trình học tiếp.', 'Attendance certificate, and what to study next.') },
    ]
  }

  function buildIncludes(program: CatalogProgram, scheduled: boolean): string[] {
    if (scheduled) {
      return [
        pick('Một ngày thực hành trực tiếp cùng giảng viên', 'A full day of hands-on work with the instructor'),
        pick('Nhóm nhỏ, tối đa 12 học viên mỗi buổi', 'Small group — 12 learners maximum'),
        pick('Tài liệu in mang về', 'Printed handouts to take home'),
        pick('Chứng nhận tham dự', 'Certificate of attendance'),
        pick('Nước và ăn nhẹ giữa buổi', 'Refreshments during the breaks'),
        pick('Nhóm hỏi đáp cùng giảng viên sau khóa', 'A post-course Q&A group with the instructor'),
      ]
    }
    return [
      pick(`${program.lessons ?? 0} bài học video, xem lại không giới hạn`, `${program.lessons ?? 0} video lessons, rewatch any time`),
      pick('Tài liệu PDF và checklist tải về', 'Downloadable PDFs and checklists'),
      pick('Bài kiểm tra sau mỗi phần', 'A quiz at the end of every part'),
      pick('Truy cập trọn đời, gồm các bản cập nhật', 'Lifetime access, updates included'),
      pick('Chứng nhận hoàn thành có mã tra cứu', 'Certificate of completion with a verification code'),
      pick('Xem được trên điện thoại và máy tính', 'Works on phone and desktop'),
    ]
  }

  function detailFor(slug: string): ProgramDetail | null {
    const program = programs.value.find((p) => p.slug === slug)
    if (!program) return null

    const tpl = templates.value[program.topic]
    const h = hashOf(slug)
    const scheduled = Boolean(program.date)

    const avg = Number((4.5 + (h % 5) / 10).toFixed(1))
    const five = 70 + (h % 12)
    const four = Math.round((100 - five) * 0.62)
    const three = Math.round((100 - five - four) * 0.6)
    const two = Math.max(1, Math.round((100 - five - four - three) / 2))
    const distribution = [five, four, three, two, Math.max(0, 100 - five - four - three - two)]

    const pool = reviewPool.value
    const reviews = [0, 1, 2].map((i) => {
      const r = pool[(h + i) % pool.length]
      return { ...r, initials: initialsOf(r.name) }
    })

    const modules = scheduled ? [] : buildModules(program, program.topic)

    // Same topic first — that is what someone reading this page is shopping for.
    const sameTopic = programs.value.filter((p) => p.slug !== slug && p.topic === program.topic)
    const sameKind = programs.value.filter((p) => p.slug !== slug && p.topic !== program.topic && p.kind === program.kind)
    const related = [...sameTopic, ...sameKind].slice(0, 4)

    const level = program.kind === 'mini'
      ? pick('Cơ bản — không cần kiến thức nền', 'Beginner — no prior knowledge')
      : program.price >= 1_500_000
        ? pick('Nâng cao — dành cho người đã hành nghề', 'Advanced — for working practitioners')
        : pick('Trung cấp — cần nền tảng cơ bản', 'Intermediate — some basics needed')

    return {
      program,
      scheduled,
      subtitle: tpl.subtitle,
      description: tpl.description,
      level,
      language: pick('Tiếng Việt, phụ đề Tiếng Anh', 'Vietnamese, English subtitles'),
      certificate: true,
      skills: tpl.skills,
      outcomes: tpl.outcomes,
      modules,
      agenda: scheduled ? buildAgenda(program.topic) : [],
      includes: buildIncludes(program, scheduled),
      instructor: {
        ...tpl.instructor,
        initials: initialsOf(tpl.instructor.name),
        courses: 3 + (h % 5),
        learners: 800 + (h % 40) * 55,
      },
      rating: { avg, count: 60 + (h % 840), distribution },
      reviews,
      faq: [...baseFaq.value, { q: tpl.faq[0], a: tpl.faq[1] }],
      enrolled: scheduled ? 40 + (h % 160) : 300 + (h % 11_000),
      seatsLeft: 2 + (h % 7),
      related,
      totalMinutes: modules.reduce((sum, m) => sum + m.minutes, 0),
    }
  }

  return { detailFor }
}

/**
 * One course, from the API, with the template filling what the API cannot store.
 *
 * The API owns everything a person authored — title, syllabus, outcomes, FAQ,
 * the instructor, the approved reviews. It has no column for a workshop agenda
 * or a "what's included" list, so those still come from the topic template, and
 * the merge below is where the two meet. Anything the API returns wins; the
 * template only ever fills a gap.
 *
 * If the API is unreachable the whole thing falls back to the template, which
 * is what `detailFor` already did. A course page that 500s because a backend
 * blinked is worse than one showing last week's outline.
 */
export async function useProgramDetailFor(slugRef: Ref<string> | string) {
  const { detailFor } = useProgramDetail()
  const { programs } = useLearningCatalog()
  const slug = computed(() => String(unref(slugRef)))

  // Awaited: the page checks `detail.value` synchronously in setup to decide
  // whether to throw a 404, and an un-awaited fetch is still null at that point.
  const { data } = await useAsyncData(
    () => `program-detail-${slug.value}`,
    () => $fetch<Partial<ProgramDetail>>(`/api/programs/${encodeURIComponent(slug.value)}`),
    { watch: [slug], default: () => null },
  )

  return computed<ProgramDetail | null>(() => {
    const template = detailFor(slug.value)
    const live = data.value
    if (!live) return template
    if (!template) {
      // A course that exists in the API but not in the fallback catalogue: the
      // normal case once the API is the source of truth.
      return {
        ...(live as ProgramDetail),
        agenda: live.agenda?.length ? live.agenda : [],
        includes: live.includes?.length ? live.includes : [],
        related: relatedTo(live.program?.slug, live.program?.topic),
      }
    }
    return {
      ...template,
      ...live,
      // The API has no column for either; both stay the template's job.
      agenda: live.agenda?.length ? live.agenda : template.agenda,
      includes: live.includes?.length ? live.includes : template.includes,
      instructor: live.instructor ?? template.instructor,
      // Related courses are a property of the catalogue, not of this course.
      related: relatedTo(slug.value, live.program?.topic ?? template.program.topic),
    } as ProgramDetail
  })

  /** Same topic first — that is what someone reading this page is shopping for. */
  function relatedTo(currentSlug?: string, topic?: string) {
    const all = programs.value
    const sameTopic = all.filter((p) => p.slug !== currentSlug && p.topic === topic)
    const rest = all.filter((p) => p.slug !== currentSlug && p.topic !== topic)
    return [...sameTopic, ...rest].slice(0, 4)
  }
}
