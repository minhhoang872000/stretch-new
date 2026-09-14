/**
 * Learning Hub catalogue data.
 *
 * These are COURSE/CLASS records, not UI strings — so they live here with both
 * language variants inline instead of in i18n/locales (which would bloat the
 * locale files with per-item keys). When a real courses API exists, swap the
 * static arrays below for a `$fetch` and keep the same returned shape.
 *
 * The dated sessions used to live here too; they are derived from the catalogue
 * in `useLearningSchedule` now, so the hub panel and /learning-hub/schedule can
 * never disagree about a date, a price or how many seats are left.
 */

export type LearningLevel = 'mini' | 'course'

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

export function useLearningHub() {
  // The Learning Hub ships in Vietnamese only (2026-08): its audience is local
  // practitioners, and half-translated course copy reads worse than none. The
  // English strings below stay as `pick()`'s second argument — restoring the
  // translation means restoring the locale check here, nothing else.
  const pick = (viText: string, _enText: string) => viText

  /** 4.500.000đ */
  function formatPrice(value: number): string {
    if (value <= 0) return pick('Miễn phí', 'Free')
    return `${value.toLocaleString('vi-VN')}đ`
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

  return { courses, formatPrice }
}
