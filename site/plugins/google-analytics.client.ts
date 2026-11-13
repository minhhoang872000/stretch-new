/**
 * Google Analytics 4 (gtag.js).
 *
 * Only on the production hostnames: localhost, `nuxt preview` and the
 * *.pages.dev preview/demo deployments would otherwise mix test traffic into
 * the real property.
 *
 * Page views are sent by hand (`send_page_view: false`) on `page:finish`, not
 * by GA's automatic history listener: that one fires on pushState, before the
 * new page has set its <title>, so every client-side navigation would be
 * reported under the previous page's title. It would also count the URL
 * rewrites the SMAX widget does while it starts. In the GA property, turn OFF
 * Admin → Data streams → (web) → Enhanced measurement → Page views → "Page
 * changes based on browser history events", or client navigations count twice.
 *
 * The `gtag` stub queues calls into `dataLayer` straight away, so events from
 * useTracking() made before gtag.js has downloaded are not lost.
 */
const HOSTS = ['stretch.vn', 'www.stretch.vn']

export default defineNuxtPlugin((nuxtApp) => {
  const id = useRuntimeConfig().public.gaMeasurementId as string
  if (!id || !HOSTS.includes(window.location.hostname)) return

  const w = window as any
  w.dataLayer = w.dataLayer || []
  w.gtag = function gtag() {
    // gtag.js expects the `arguments` object itself, not an array.
    // eslint-disable-next-line prefer-rest-params
    w.dataLayer.push(arguments)
  }
  w.gtag('js', new Date())
  w.gtag('config', id, { send_page_view: false })

  let lastPath = ''
  const sendPageView = () => {
    const path = window.location.pathname + window.location.search
    // page:finish can fire twice for one navigation (Suspense + transition).
    if (path === lastPath) return
    lastPath = path
    w.gtag('event', 'page_view', {
      page_location: window.location.href,
      page_path: path,
      page_title: document.title,
    })
  }

  // unhead writes the new <title> after the page has rendered; wait a tick.
  nuxtApp.hook('page:finish', () => {
    nextTick(() => setTimeout(sendPageView, 0))
  })

  // Download the library once the page is up, off the critical path.
  nuxtApp.hook('app:mounted', () => {
    const load = () => {
      const script = document.createElement('script')
      script.src = `https://www.googletagmanager.com/gtag/js?id=${id}`
      script.async = true
      document.head.appendChild(script)
    }
    if ('requestIdleCallback' in window) w.requestIdleCallback(load, { timeout: 3000 })
    else setTimeout(load, 1500)
  })
})
