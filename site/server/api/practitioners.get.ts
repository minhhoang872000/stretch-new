import { getPractitionersByService, practitioners as allPractitioners } from '~/server/utils/db'

export default defineEventHandler((event) => {
  const query = getQuery(event)
  const serviceId = query.service as string

  if (serviceId) {
    return getPractitionersByService(serviceId)
  }

  return allPractitioners
})
