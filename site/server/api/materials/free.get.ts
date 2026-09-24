import { fetchFreeMaterials } from '~~/server/utils/academyApi'

/**
 * GET /api/materials/free — the Learning Hub's "Tài liệu miễn phí".
 *
 * Every file uploaded to a free lesson, or to any lesson of a free programme,
 * across published programmes (the API decides what counts as free). Each entry
 * names the course and lesson it came from so the card can link back.
 */
export default defineEventHandler(async (event) => {
  const materials = await fetchFreeMaterials(event)
  setHeader(event, 'cache-control', 'public, max-age=120, stale-while-revalidate=600')
  return {
    materials: materials.map((m: any) => ({
      name: String(m.name || 'Tài liệu'),
      url: String(m.url),
      size: Number(m.size) || 0,
      mime: String(m.mime || ''),
      programSlug: String(m.programSlug || ''),
      programTitle: String(m.programTitle || ''),
      lessonTitle: String(m.lessonTitle || ''),
      lessonKey: `${Number(m.moduleIndex) || 0}-${Number(m.itemIndex) || 0}`,
    })),
  }
})
