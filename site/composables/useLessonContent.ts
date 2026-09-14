/**
 * What a single lesson shows inside the player.
 *
 * PLACEHOLDER CONTENT, derived — not invented per lesson. Reading lessons are
 * written from the module's own summary plus the course's stated outcomes, and
 * quiz questions are assembled so that the correct answer really is the correct
 * answer for that module (the right summary among the other modules' summaries,
 * a skill the course teaches among skills it does not). That keeps the player
 * honest to click through while the real lesson bodies do not exist yet.
 *
 * Lesson videos are YouTube links carried on the syllabus item itself (see
 * `LESSON_VIDEOS` in `useProgramDetail`); `parseYoutubeId` below turns whatever
 * form was pasted into an id, and a lesson without one gets a poster saying the
 * video is not up yet rather than a play button that does nothing.
 */
import type { ProgramDetail, SyllabusItem } from '~/composables/useProgramDetail'

export interface QuizQuestion {
  question: string
  options: string[]
  /** Index into `options`. */
  answer: number
}

/**
 * Pulls the video id out of whatever YouTube form was pasted: a watch URL, a
 * youtu.be short link, an embed or /live/ or /shorts/ URL, or a bare id. Extra
 * query params (`?t=`, `&list=`) are ignored.
 *
 * Returns null for anything that is not a YouTube id, so the player can show its
 * "video not up yet" poster instead of an iframe pointed at nothing.
 */
export function parseYoutubeId(input?: string | null): string | null {
  if (!input) return null
  const raw = input.trim()

  // A bare id: 11 chars of the YouTube alphabet.
  if (/^[\w-]{11}$/.test(raw)) return raw

  try {
    const url = new URL(raw)
    const host = url.hostname.replace(/^www\./, '')

    if (host === 'youtu.be') {
      const id = url.pathname.slice(1).split('/')[0]
      return /^[\w-]{11}$/.test(id) ? id : null
    }

    if (host.endsWith('youtube.com') || host.endsWith('youtube-nocookie.com')) {
      const v = url.searchParams.get('v')
      if (v && /^[\w-]{11}$/.test(v)) return v

      // /embed/<id>, /live/<id>, /shorts/<id>, /v/<id>
      const parts = url.pathname.split('/').filter(Boolean)
      const id = parts[1]
      if (['embed', 'live', 'shorts', 'v'].includes(parts[0]) && id && /^[\w-]{11}$/.test(id)) {
        return id
      }
    }
  } catch {
    // Not a URL at all — and it was not a bare id either.
  }

  return null
}

/** Skills no Stretch programme covers — plausible enough to be a real choice,
    wrong enough that picking one is a wrong answer. */
const OFF_TOPIC_SKILLS = [
  'Đọc phim X-quang và MRI',
  'Kê đơn thuốc giảm đau',
  'Phẫu thuật nội soi khớp',
  'Xét nghiệm sinh hóa máu',
  'Điều trị hô hấp cho trẻ sinh non',
  'Chẩn đoán hình ảnh thần kinh',
]

export function useLessonContent() {
  /** Deterministic pick so the same lesson always asks the same question. */
  function rotate<T>(list: T[], seed: number, count: number): T[] {
    if (!list.length) return []
    const out: T[] = []
    for (let i = 0; i < count; i++) out.push(list[(seed + i) % list.length])
    return out
  }

  function reading(detail: ProgramDetail, moduleIndex: number, item: SyllabusItem): string[] {
    const mod = detail.modules[moduleIndex]
    if (!mod) return []

    const outcome = detail.outcomes[moduleIndex % detail.outcomes.length]
    const skills = rotate(detail.skills, moduleIndex, 2).join(' và ')

    return [
      `${mod.summary} Phần đọc này tóm lại những điểm bạn cần nhớ trước khi sang bài thực hành, và nêu rõ chỗ người mới thường bỏ sót.`,
      `Trọng tâm của “${mod.title}” là ${skills.toLowerCase()}. Bạn nên đọc chậm phần này một lượt, sau đó quay lại video và làm theo từng bước — thứ tự đó giúp bạn nhớ lâu hơn là xem trước rồi đọc sau.`,
      `Sau khi hoàn thành phần này, bạn ${outcome.toLowerCase()}. Nếu chưa thấy chắc, hãy làm lại bài thực hành trước khi đi tiếp: các phần sau đều dựa trên kỹ năng này.`,
      `Ghi chú của riêng bạn ở tab “Ghi chú” sẽ được lưu lại theo từng bài, nên bạn cứ viết lại những gì muốn thử với khách hàng của mình. ${item.title} là bài đọc ngắn — dành khoảng ${item.minutes} phút là đủ.`,
    ]
  }

  function checklist(detail: ProgramDetail, moduleIndex: number): string[] {
    const mod = detail.modules[moduleIndex]
    if (!mod) return []
    return [
      `Xem lại toàn bộ ${mod.items.length} bài của phần “${mod.title}”`,
      `Thực hành ${rotate(detail.skills, moduleIndex, 1)[0]?.toLowerCase() ?? 'kỹ năng chính'} ít nhất 3 lần`,
      'Ghi lại một ca thực tế bạn đã áp dụng',
      'Làm bài kiểm tra cuối phần',
    ]
  }

  function quiz(detail: ProgramDetail, moduleIndex: number): QuizQuestion[] {
    const mod = detail.modules[moduleIndex]
    if (!mod) return []

    // Q1: this module's summary against the other modules' summaries.
    const otherSummaries = detail.modules
      .filter((_, i) => i !== moduleIndex)
      .map((m) => m.summary)
    const wrongSummaries = rotate(otherSummaries, moduleIndex + 1, Math.min(3, otherSummaries.length))
    const summaryOptions = [mod.summary, ...wrongSummaries]
    const summaryAnswer = moduleIndex % summaryOptions.length
    // Put the correct answer at a rotating position instead of always first.
    ;[summaryOptions[0], summaryOptions[summaryAnswer]] = [summaryOptions[summaryAnswer], summaryOptions[0]]

    // Q2: a skill this course teaches against skills it does not.
    const skill = detail.skills[moduleIndex % detail.skills.length]
    const offTopic = rotate(OFF_TOPIC_SKILLS, moduleIndex, 3)
    const skillOptions = [...offTopic]
    const skillAnswer = (moduleIndex + 1) % 4
    skillOptions.splice(skillAnswer, 0, skill)

    return [
      {
        question: `Phần “${mod.title}” tập trung vào điều gì?`,
        options: summaryOptions,
        answer: summaryAnswer,
      },
      {
        question: 'Kỹ năng nào nằm trong nội dung chương trình này?',
        options: skillOptions.slice(0, 4),
        answer: skillAnswer,
      },
    ]
  }

  return { reading, checklist, quiz }
}
