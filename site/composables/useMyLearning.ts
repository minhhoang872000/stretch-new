/**
 * The signed-in learner's enrolments.
 *
 * PLACEHOLDER DATA — there is no enrolment API yet, so this is a fixed sample
 * shaped the way the real endpoint should return it: one list of in-progress
 * enrolments carrying resume state, one list of finished ones carrying the
 * certificate reference. Swap the arrays for a `$fetch` keyed by the signed-in
 * user and the page needs no changes.
 */

export interface ActiveEnrolment {
  slug: string
  title: string
  image: string
  mode: 'online' | 'offline'
  lesson: number
  lessons: number
  /** 0–100, kept alongside the lesson counter because a lesson is not a
      uniform unit of work — a 20-minute video and a quiz both count as one. */
  percent: number
  nextLesson: string
  timeLeft: string
  updatedAt: string
}

export interface CompletedEnrolment {
  slug: string
  title: string
  image: string
  completedAt: string
  certificateCode: string
}

export function useMyLearning() {
  const { locale } = useI18n()
  const vi = computed(() => locale.value === 'vi')
  const pick = (viText: string, enText: string) => (vi.value ? viText : enText)

  const active = computed<ActiveEnrolment[]>(() => [
    {
      slug: 'giai-phau-van-dong-hoc-ung-dung',
      title: pick('Giải phẫu & Vận động học ứng dụng', 'Applied Anatomy & Kinesiology'),
      image: '/images/man-neck-pain.png',
      mode: 'online',
      lesson: 12,
      lessons: 45,
      percent: 60,
      nextLesson: pick('Cơ vai và cánh tay — Phần 1', 'Shoulder & arm muscles — Part 1'),
      timeLeft: pick('2 giờ 15 phút', '2 hr 15 min'),
      updatedAt: '20/07/2026',
    },
    {
      slug: 'danh-gia-van-dong-co-ban',
      title: pick('Đánh giá vận động cơ bản', 'Movement Assessment Basics'),
      image: '/education-workshop.png',
      mode: 'online',
      lesson: 3,
      lessons: 12,
      percent: 25,
      nextLesson: pick('Quan sát chuyển động', 'Observing movement'),
      timeLeft: pick('1 giờ', '1 hour'),
      updatedAt: '18/07/2026',
    },
  ])

  const completed = computed<CompletedEnrolment[]>(() => [
    {
      slug: 'road2rehab-foundation',
      title: 'Road2Rehab Foundation',
      image: '/education-gallery-3.png',
      completedAt: '15/06/2026',
      certificateCode: 'R2R-2026-0148',
    },
    {
      slug: 'phuc-hoi-vai-toan-dien',
      title: pick('Phục hồi vai toàn diện', 'Complete Shoulder Rehab'),
      image: '/experiencing-pain-absolute.png',
      completedAt: '10/07/2026',
      certificateCode: 'PHV-2026-0072',
    },
    {
      slug: 'mobility-cho-than-duoi',
      title: pick('Mobility cho thân dưới', 'Lower Body Mobility'),
      image: '/education-gallery-1.png',
      completedAt: '28/05/2026',
      certificateCode: 'MOB-2026-0031',
    },
  ])

  return { active, completed }
}
