/**
 * Blog categories — proxied from the lead-tracker-api (Postgres source of truth).
 * Falls back to the built-in defaults if the API is unreachable so the
 * Sharing Hub never breaks.
 */

interface SiteCategory {
  key: string
  label: string
  description: string | null
  icon: string
  iconBg: string
  iconColor: string
}

const DEFAULT_CATEGORIES: SiteCategory[] = [
  { key: 'articles', label: 'Knowledge', description: 'Educational articles, guides, and research', icon: 'menu_book', iconBg: 'bg-teal-50', iconColor: 'text-teal-600' },
  { key: 'company_updates', label: 'Company Updates', description: 'News, announcements, and milestones', icon: 'campaign', iconBg: 'bg-blue-50', iconColor: 'text-blue-600' },
  { key: 'team_stories', label: 'Team Stories', description: 'People, culture, and behind the scenes', icon: 'groups', iconBg: 'bg-purple-50', iconColor: 'text-purple-600' },
  { key: 'events', label: 'Events', description: 'Workshops, sessions, and community events', icon: 'event', iconBg: 'bg-orange-50', iconColor: 'text-orange-500' },
]

export default defineEventHandler(async (): Promise<SiteCategory[]> => {
  const config = useRuntimeConfig()
  const base = config.public.trackingApiUrl

  if (!base) return DEFAULT_CATEGORIES

  try {
    const res = await $fetch<{ success: boolean; data?: { categories: any[] } }>(
      `${base}/api/v1/categories`,
      { timeout: 4000 },
    )
    const categories = res?.data?.categories
    if (!Array.isArray(categories) || categories.length === 0) return DEFAULT_CATEGORIES

    return categories.map((c) => ({
      key: c.key,
      label: c.label,
      description: c.description ?? null,
      icon: c.icon ?? 'category',
      iconBg: c.iconBg ?? 'bg-teal-50',
      iconColor: c.iconColor ?? 'text-teal-600',
    }))
  } catch {
    return DEFAULT_CATEGORIES
  }
})
