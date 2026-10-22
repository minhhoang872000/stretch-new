import { LOCALE_COOKIE } from '~/utils/localeCookie'

/**
 * Vietnamese is the default for people: a visitor who lands on an English URL
 * (`/`, `/individual` …) is sent to its `/vi` twin, unless they picked English
 * themselves in the header (remembered in a cookie). English URLs stay as they
 * are, so the sitemap, hreflang and GSC indexing are untouched.
 *
 * Without this, Vietnamese visitors read the English page through Chrome's
 * auto-translate ("For Individual" came out as "Cho Cá").
 *
 * Crawlers are left alone: redirecting them would hide the English pages.
 * Runs as a plugin, before the router drops the query on prerendered pages,
 * and with a hard `location.replace` so the query and hash survive.
 */
export default defineNuxtPlugin({
  name: 'default-vietnamese',
  enforce: 'pre',
  setup() {
    if (/bot|crawl|spider|slurp|lighthouse|headless|preview/i.test(navigator.userAgent)) return

    const { pathname, search, hash } = window.location
    const isVietnamese = pathname === '/vi' || pathname.startsWith('/vi/')
    const chosen = useCookie(LOCALE_COOKIE).value

    if (isVietnamese || chosen === 'en') return

    window.location.replace(`/vi${pathname === '/' ? '' : pathname}${search}${hash}`)
  },
})
