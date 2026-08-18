/**
 * Learning Hub catalogue — the unified list behind /learning-hub/programs.
 *
 * Self-paced courses and scheduled workshops are one browsable list here even
 * though they stay separate records in the backend: a visitor shopping for
 * "shoulder rehab" does not care which of the two it is. An item shows lesson
 * counts when it is self-paced and a date + place when it is scheduled.
 *
 * PLACEHOLDER DATA — same arrangement as `useLearningHub`: both language
 * variants live inline instead of in i18n/locales, which would otherwise carry
 * a key per catalogue item. Swap `PROGRAMS` for a `$fetch` when the courses API
 * exists and keep the returned shape.
 */

export type ProgramKind = 'course' | 'mini' | 'workshop'
export type ProgramMode = 'online' | 'offline'
export type ProgramTopic = 'anatomy' | 'assessment' | 'sports' | 'functional'
export type ProgramSort = 'newest' | 'price_asc' | 'price_desc'

export interface CatalogProgram {
  slug: string
  kind: ProgramKind
  mode: ProgramMode
  topic: ProgramTopic
  title: string
  image: string
  /** 0 = free */
  price: number
  /** Self-paced items: lesson count + total length. */
  lessons?: number
  duration?: string
  /** Scheduled items: start date + place. */
  date?: string
  location?: string
}

export const PROGRAMS_PER_PAGE = 8

export function useLearningCatalog() {
  const { locale } = useI18n()
  const vi = computed(() => locale.value === 'vi')
  const pick = (viText: string, enText: string) => (vi.value ? viText : enText)

  function formatPrice(value: number): string {
    if (value <= 0) return pick('Miễn phí', 'Free')
    return vi.value
      ? `${value.toLocaleString('vi-VN')}đ`
      : `₫${value.toLocaleString('en-US')}`
  }

  /** Newest first — `sort: 'newest'` keeps this order. */
  const programs = computed<CatalogProgram[]>(() => [
    {
      slug: 'giai-phau-van-dong-hoc-ung-dung',
      kind: 'course', mode: 'online', topic: 'anatomy',
      title: pick('Giải phẫu & Vận động học ứng dụng', 'Applied Anatomy & Kinesiology'),
      image: '/images/man-neck-pain.png',
      price: 1990000, lessons: 45, duration: pick('~8 giờ', '~8 hours'),
    },
    {
      slug: 'danh-gia-van-dong-co-ban',
      kind: 'workshop', mode: 'offline', topic: 'assessment',
      title: pick('Đánh giá vận động cơ bản', 'Movement Assessment Basics'),
      image: '/education-workshop.png',
      price: 490000, date: '24/09/2025', location: pick('TP.HCM', 'Ho Chi Minh City'),
    },
    {
      slug: 'phuc-hoi-vai-toan-dien',
      kind: 'course', mode: 'online', topic: 'sports',
      title: pick('Phục hồi vai toàn diện', 'Complete Shoulder Rehab'),
      image: '/experiencing-pain-absolute.png',
      price: 590000, date: '30/09/2025', location: pick('Trực tuyến', 'Online'),
    },
    {
      slug: 'lower-body-case-lab',
      kind: 'workshop', mode: 'offline', topic: 'sports',
      title: 'Lower Body Case Lab',
      image: '/marathon.png',
      price: 750000, date: '28/09/2025', location: pick('TP.HCM', 'Ho Chi Minh City'),
    },
    {
      slug: 'hieu-ve-dau-khi-van-dong',
      kind: 'mini', mode: 'online', topic: 'anatomy',
      title: pick('Hiểu về đau khi vận động', 'Understanding Pain in Movement'),
      image: '/education-class.png',
      price: 0, lessons: 5, duration: pick('35 phút', '35 min'),
    },
    {
      slug: 'nguyen-ly-lap-chuong-trinh-phuc-hoi',
      kind: 'course', mode: 'online', topic: 'functional',
      title: pick('Nguyên lý lập chương trình phục hồi', 'Rehab Programming Principles'),
      image: '/education-gallery-1.png',
      price: 1590000, lessons: 32, duration: pick('~6 giờ', '~6 hours'),
    },
    {
      slug: 'ky-thuat-mo-mem-nang-cao',
      kind: 'workshop', mode: 'offline', topic: 'assessment',
      title: pick('Kỹ thuật mô mềm nâng cao', 'Advanced Soft Tissue Techniques'),
      image: '/education-gallery-2.png',
      price: 690000, date: '18/10/2025', location: pick('Hà Nội', 'Hanoi'),
    },
    {
      slug: 'phan-tich-toi-uu-hieu-suat',
      kind: 'course', mode: 'online', topic: 'sports',
      title: pick('Phân tích & Tối ưu hiệu suất', 'Performance Analysis & Optimisation'),
      image: '/runner-who.png',
      price: 1790000, lessons: 28, duration: pick('~5 giờ', '~5 hours'),
    },
    {
      slug: 'road2rehab-foundation',
      kind: 'course', mode: 'offline', topic: 'anatomy',
      title: 'Road2Rehab Foundation',
      image: '/education-gallery-3.png',
      price: 4500000, date: '18/09/2025', location: pick('TP.HCM', 'Ho Chi Minh City'),
    },
    {
      slug: 'shoulder-assessment-lab',
      kind: 'workshop', mode: 'online', topic: 'assessment',
      title: 'Shoulder Assessment Lab',
      image: '/athlete-who.png',
      price: 490000, date: '24/09/2025', location: pick('Trực tuyến', 'Online'),
    },
    {
      slug: 'cot-song-kiem-soat-trung-tam',
      kind: 'course', mode: 'offline', topic: 'anatomy',
      title: pick('Cột sống & Kiểm soát trung tâm', 'Spine & Core Control'),
      image: '/education-gallery-4.png',
      price: 1290000, date: '05/12/2025', location: pick('TP.HCM', 'Ho Chi Minh City'),
    },
    {
      slug: 'khoi-dong-phong-ngua-chan-thuong',
      kind: 'mini', mode: 'online', topic: 'sports',
      title: pick('Khởi động & Phòng ngừa chấn thương', 'Warm-up & Injury Prevention'),
      image: '/pickleball.png',
      price: 0, lessons: 6, duration: pick('40 phút', '40 min'),
    },
    {
      slug: 'van-dong-chuc-nang-cho-nguoi-van-phong',
      kind: 'course', mode: 'online', topic: 'functional',
      title: pick('Vận động chức năng cho người văn phòng', 'Functional Movement for Desk Workers'),
      image: '/office-who.png',
      price: 890000, lessons: 20, duration: pick('~3 giờ', '~3 hours'),
    },
    {
      slug: 'danh-gia-dang-di-ban-chan',
      kind: 'workshop', mode: 'offline', topic: 'assessment',
      title: pick('Đánh giá dáng đi & Bàn chân', 'Gait & Foot Assessment'),
      image: '/tennis.png',
      price: 850000, date: '09/11/2025', location: pick('TP.HCM', 'Ho Chi Minh City'),
    },
    {
      slug: 'giai-phau-chi-tren-ung-dung',
      kind: 'course', mode: 'offline', topic: 'anatomy',
      title: pick('Giải phẫu chi trên ứng dụng', 'Applied Upper Limb Anatomy'),
      image: '/education-gallery-5.png',
      price: 2290000, date: '12/10/2025', location: pick('TP.HCM', 'Ho Chi Minh City'),
    },
    {
      slug: 'tho-kiem-soat-van-dong',
      kind: 'mini', mode: 'online', topic: 'functional',
      title: pick('Thở & Kiểm soát vận động', 'Breathing & Motor Control'),
      image: '/recovery-who.png',
      price: 0, lessons: 4, duration: pick('25 phút', '25 min'),
    },
    {
      slug: 'phuc-hoi-sau-chan-thuong-goi',
      kind: 'course', mode: 'offline', topic: 'sports',
      title: pick('Phục hồi sau chấn thương gối', 'Knee Injury Rehabilitation'),
      image: '/active-who.png',
      price: 2590000, date: '22/11/2025', location: pick('Hà Nội', 'Hanoi'),
    },
    {
      slug: 'giai-phau-chi-duoi-ung-dung',
      kind: 'mini', mode: 'online', topic: 'anatomy',
      title: pick('Giải phẫu chi dưới ứng dụng', 'Applied Lower Limb Anatomy'),
      image: '/corporate-sports.png',
      price: 0, lessons: 7, duration: pick('50 phút', '50 min'),
    },
  ])

  /** Facet counts come from the whole catalogue, not the filtered slice —
      otherwise every option would read 0 as soon as a filter narrowed things. */
  function countBy<K extends keyof CatalogProgram>(field: K, value: CatalogProgram[K]) {
    return programs.value.filter((p) => p[field] === value).length
  }

  const counts = computed(() => ({
    total: programs.value.length,
    kind: {
      course: countBy('kind', 'course'),
      mini: countBy('kind', 'mini'),
      workshop: countBy('kind', 'workshop'),
    },
    mode: {
      online: countBy('mode', 'online'),
      offline: countBy('mode', 'offline'),
    },
    topic: {
      anatomy: countBy('topic', 'anatomy'),
      assessment: countBy('topic', 'assessment'),
      sports: countBy('topic', 'sports'),
      functional: countBy('topic', 'functional'),
    },
  }))

  return { programs, counts, formatPrice, PROGRAMS_PER_PAGE }
}

/**
 * Saved programs. localStorage only — a real "my saved list" has to live on the
 * account so it follows the learner across devices; this keeps the bookmark
 * button honest in the meantime rather than leaving it inert.
 */
const SAVED_KEY = 'stretch:saved-programs'

export function useSavedPrograms() {
  const saved = useState<string[]>('saved-programs', () => [])

  onMounted(() => {
    try {
      const raw = localStorage.getItem(SAVED_KEY)
      if (raw) saved.value = JSON.parse(raw)
    } catch {
      // corrupted or unavailable storage — start from an empty list
    }
  })

  function toggle(slug: string) {
    saved.value = saved.value.includes(slug)
      ? saved.value.filter((s) => s !== slug)
      : [...saved.value, slug]
    try {
      localStorage.setItem(SAVED_KEY, JSON.stringify(saved.value))
    } catch {
      // storage full or blocked — the in-memory list still works this session
    }
  }

  const isSaved = (slug: string) => saved.value.includes(slug)

  return { saved, toggle, isSaved }
}
