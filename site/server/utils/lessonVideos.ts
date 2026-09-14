/**
 * Lesson video links — SERVER ONLY.
 *
 * These used to sit in `useProgramDetail`, which meant every id shipped inside
 * the page payload: anyone could read the ids out of the HTML without signing
 * in, and an unlisted YouTube video is watchable by anyone holding its id. Now
 * the ids never leave the server until `/api/lessons/video` has checked the
 * session, so at minimum a stranger cannot harvest the catalogue's videos.
 *
 * ⚠️ WHAT THIS DOES AND DOES NOT PROTECT
 * It stops people who are not signed in. It does NOT stop a signed-in learner
 * from copying the id out of their own network tab and passing it on — YouTube
 * has no per-viewer access control for embeds and no domain allowlist. Real
 * protection needs a host that signs playback (Cloudflare Stream: signed tokens
 * with an expiry plus Allowed Origins), and it is only ever as strong as the
 * enrolment record behind it.
 *
 * Videos are addressed by their ORDINAL among the course's video lessons — the
 * first video lesson is 0, the second 1, and so on. The client counts that off
 * its own syllabus, so no lesson ids have to be kept in sync across the wire.
 */

/** Videos of a real course, in lesson order. THE PLACE TO PASTE REAL LINKS. */
const COURSE_VIDEOS: Record<string, string[]> = {}

/**
 * DEMO VIDEOS — NOT STRETCH'S OWN CONTENT.
 *
 * Public Vietnamese stretching/mobility videos from other channels, grouped by
 * topic and cycled across a course's video lessons so the player has something
 * on-topic to show. Each id was checked against YouTube's oEmbed endpoint on
 * 2026-08-20: the video exists and its uploader allows embedding. Anything
 * served from this pool is flagged `demo` in the response and the player labels
 * it, so it can never pass for a Stretch lesson.
 */
const DEMO_VIDEOS = {
  // Hướng dẫn stretching cho người mới · 7 động tác mỗi ngày · dynamic stretching
  anatomy: ['gXKA_PiaTa8', '6ARC-2_ha8Y', 'USuTyTUzSbY'],
  // Tư thế ngồi & cột sống · trị liệu vai cổ gáy · kỹ thuật giãn cơ
  assessment: ['px7P-xHijaU', 'e4qZY6ubgZE', 'gXKA_PiaTa8'],
  // Giãn cơ sau tập · giãn cơ mông–chân–lưng · giãn cơ thân dưới
  sports: ['xavAmq9BFJ0', '8UBxTMpZHLE', 'E7bryOytfR4'],
  // Bài tập tại ghế · bài tập giảm mỏi tại chỗ · trị liệu vai cổ gáy
  functional: ['dUcJVqlo0HE', '5mrdUnijO44', 'e4qZY6ubgZE'],
} as const

type DemoTopic = keyof typeof DEMO_VIDEOS

/**
 * Which demo pool each catalogue slug draws from. This mirrors the `topic` field
 * in `useLearningCatalog` — deliberately, rather than trusting a topic sent by
 * the client, which would let anyone ask for any pool. It disappears with the
 * demo pool itself once the courses API serves real videos per lesson.
 */
const TOPIC_BY_SLUG: Record<string, DemoTopic> = {
  'giai-phau-van-dong-hoc-ung-dung': 'anatomy',
  'hieu-ve-dau-khi-van-dong': 'anatomy',
  'road2rehab-foundation': 'anatomy',
  'cot-song-kiem-soat-trung-tam': 'anatomy',
  'giai-phau-chi-tren-ung-dung': 'anatomy',
  'giai-phau-chi-duoi-ung-dung': 'anatomy',
  'danh-gia-van-dong-co-ban': 'assessment',
  'ky-thuat-mo-mem-nang-cao': 'assessment',
  'shoulder-assessment-lab': 'assessment',
  'danh-gia-dang-di-ban-chan': 'assessment',
  'phuc-hoi-vai-toan-dien': 'sports',
  'lower-body-case-lab': 'sports',
  'phan-tich-toi-uu-hieu-suat': 'sports',
  'khoi-dong-phong-ngua-chan-thuong': 'sports',
  'phuc-hoi-sau-chan-thuong-goi': 'sports',
  'nguyen-ly-lap-chuong-trinh-phuc-hoi': 'functional',
  'van-dong-chuc-nang-cho-nguoi-van-phong': 'functional',
  'tho-kiem-soat-van-dong': 'functional',
}

export interface LessonVideo {
  /** As authored: a YouTube URL in any form, or a bare id. The client parses it. */
  video: string
  /** From the demo pool, not from Stretch's own uploads. */
  demo: boolean
}

/**
 * The video for the `ordinal`-th video lesson of `slug`, or null when there is
 * none. Real lists run out at their end; the demo pool cycles, because a course
 * has more video lessons than the pool has videos.
 */
export function lessonVideo(slug: string, ordinal: number): LessonVideo | null {
  if (!Number.isInteger(ordinal) || ordinal < 0) return null

  const real = COURSE_VIDEOS[slug]
  if (real) {
    const video = real[ordinal]
    return video ? { video, demo: false } : null
  }

  const topic = TOPIC_BY_SLUG[slug]
  if (!topic) return null

  const pool = DEMO_VIDEOS[topic]
  return pool.length ? { video: pool[ordinal % pool.length], demo: true } : null
}
