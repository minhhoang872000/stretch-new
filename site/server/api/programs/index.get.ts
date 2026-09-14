import type { ApiProgram } from '~~/server/utils/academyApi'
import {
  durationLabel,
  displayDate,
  fetchPrograms,
  fetchSessions,
  nextSessionByProgram,
} from '~~/server/utils/academyApi'

/**
 * GET /api/programs — the Learning Hub catalogue.
 *
 * Returns exactly the `CatalogProgram[]` the composable was already built
 * against, so the catalogue, the schedule panel and the detail page all keep
 * working off one shape. Self-paced items carry a lesson count and a length;
 * scheduled ones carry the next date, its hours and where it happens.
 *
 * Cached briefly: the catalogue changes when someone publishes a course, which
 * is a few times a month, and every visitor to the hub asks for it.
 */
export default defineEventHandler(async (event) => {
  const [programs, sessions] = await Promise.all([fetchPrograms(event), fetchSessions(event)])
  const nextSession = nextSessionByProgram(sessions)

  setHeader(event, 'cache-control', 'public, max-age=60, stale-while-revalidate=300')

  return {
    programs: programs.map((program: ApiProgram) => {
      const session = nextSession.get(program.id)
      return {
        slug: program.slug,
        kind: program.kind,
        mode: program.mode,
        topic: program.topic,
        title: program.title,
        image: program.image || '/images/man-neck-pain.png',
        price: program.price,
        // A scheduled item shows its date; a self-paced one shows how much of it
        // there is. An item with both shows both, which is correct: a workshop
        // can also ship recorded material.
        ...(program.lessons
          ? { lessons: program.lessons, duration: durationLabel(program.minutes) }
          : {}),
        ...(session
          ? { date: displayDate(session.date), time: session.time, location: session.location }
          : {}),
      }
    }),
  }
})
