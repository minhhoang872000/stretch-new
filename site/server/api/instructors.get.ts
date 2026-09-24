import { fetchInstructors } from '~~/server/utils/academyApi'

/**
 * GET /api/instructors — the teaching team, public fields only.
 *
 * The API record also carries each instructor's email and phone; those are for
 * the console, never for a public page, so this route picks what the hub shows
 * and drops the rest.
 */
export default defineEventHandler(async (event) => {
  const instructors = await fetchInstructors(event)
  setHeader(event, 'cache-control', 'public, max-age=300, stale-while-revalidate=600')
  return {
    instructors: instructors.map((i: any) => ({
      id: String(i.id),
      name: String(i.name || ''),
      role: String(i.role || ''),
      programs: Number(i.programs) || 0,
      learners: Number(i.learners) || 0,
    })),
  }
})
