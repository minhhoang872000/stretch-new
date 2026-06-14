import { fetchSitePosts } from '~/server/utils/blogApi'

export default defineEventHandler((event) => {
  const query = getQuery(event)
  return fetchSitePosts({
    status: query.status as string | undefined,
    categoryKey: query.categoryKey as string | undefined,
    search: query.search as string | undefined,
  })
})
