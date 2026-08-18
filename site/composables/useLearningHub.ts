/**
 * Learning Hub catalogue data.
 *
 * These are COURSE/CLASS records, not UI strings — so they live here with both
 * language variants inline instead of in i18n/locales (which would bloat the
 * locale files with per-item keys). When a real courses API exists, swap the
 * static arrays below for a `$fetch` and keep the same returned shape.
 */

export type LearningLevel = 'mini' | 'course'
export type LearningSeatStatus = 'open' | 'few' | 'full'
export type LearningSessionKind = 'course' | 'workshop'

export interface LearningCourse {
  slug: string
  kind: LearningLevel
  title: string
  lessons: string
  duration: string
  /** 0 = free */
  price: number
  image: string
  /** Dark cover cards render white text over the image. */
  dark: boolean
}

export interface LearningSession {
  id: string
  day: string
  month: string
  title: string
  /** Drives the badge colour on the schedule row. */
  kind: LearningSessionKind
  format: string
  mode: string
  location: string
  price: number
  status: LearningSeatStatus
}

export function useLearningHub() {
  const { locale } = useI18n()
  const vi = computed(() => locale.value === 'vi')
  const pick = (viText: string, enText: string) => (vi.value ? viText : enText)

  /** 4.500.000đ / ₫4,500,000 depending on locale. */
  function formatPrice(value: number): string {
    if (value <= 0) return pick('Miễn phí', 'Free')
    return vi.value
      ? `${value.toLocaleString('vi-VN')}đ`
      : `₫${value.toLocaleString('en-US')}`
  }

  const courses = computed<LearningCourse[]>(() => [
    {
      slug: 'hieu-ve-dau-khi-van-dong',
      kind: 'mini',
      title: pick('Hiểu về đau khi vận động', 'Understanding Pain in Movement'),
      lessons: pick('5 bài học', '5 lessons'),
      duration: pick('35 phút', '35 min'),
      price: 0,
      image: '/experiencing-pain-absolute.png',
      dark: true,
    },
    {
      slug: 'giai-phau-van-dong-hoc-ung-dung',
      kind: 'course',
      title: pick(
        'Giải phẫu & Vận động học ứng dụng',
        'Applied Anatomy & Kinesiology',
      ),
      lessons: pick('45 bài học', '45 lessons'),
      duration: pick('~6 giờ', '~6 hours'),
      price: 1990000,
      image: '/images/man-neck-pain.png',
      dark: false,
    },
  ])

  const sessions = computed<LearningSession[]>(() => [
    {
      id: 'road2rehab-foundation',
      day: '18',
      month: pick('TH9', 'SEP'),
      title: 'Road2Rehab Foundation',
      kind: 'course',
      format: pick('Khóa học', 'Course'),
      mode: pick('Trực tiếp', 'In person'),
      location: pick('TP.HCM', 'Ho Chi Minh City'),
      price: 4500000,
      status: 'open',
    },
    {
      id: 'shoulder-assessment-lab',
      day: '24',
      month: pick('TH9', 'SEP'),
      title: 'Shoulder Assessment Lab',
      kind: 'workshop',
      format: 'Workshop',
      mode: pick('Trực tuyến', 'Online'),
      location: pick('Trực tuyến', 'Online'),
      price: 490000,
      status: 'open',
    },
    {
      id: 'lower-body-case-lab',
      day: '28',
      month: pick('TH9', 'SEP'),
      title: 'Lower Body Case Lab',
      kind: 'workshop',
      format: 'Workshop',
      mode: pick('Trực tiếp', 'In person'),
      location: pick('TP.HCM', 'Ho Chi Minh City'),
      price: 750000,
      status: 'few',
    },
  ])

  return { courses, sessions, formatPrice }
}
