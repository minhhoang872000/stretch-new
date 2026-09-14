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

  /**
   * The hub's featured self-paced courses — the first few from the same
   * catalogue the /programs page lists (API first, seed list when the API is
   * unreachable). They used to be a hand-written pair here, which meant the
   * hub could advertise a course the catalogue no longer had: the card linked
   * to a detail page that 404'd or, worse, crashed on a half-loaded record.
   */
  const { programs } = useLearningCatalog()
  const courses = computed<LearningCourse[]>(() =>
    programs.value
      .filter((p) => p.kind === 'mini' || p.kind === 'course')
      .slice(0, 4)
      .map((p, i) => ({
        slug: p.slug,
        kind: p.kind === 'mini' ? 'mini' : 'course',
        title: p.title,
        lessons: p.lessons ? pick(`${p.lessons} bài học`, `${p.lessons} lessons`) : '',
        duration: p.duration || '',
        price: p.price,
        image: p.image || '/images/man-neck-pain.png',
        // Alternate dark covers so the row keeps its rhythm whatever the images are.
        dark: i % 2 === 0,
      })),
  )

  return { courses, formatPrice }
}
