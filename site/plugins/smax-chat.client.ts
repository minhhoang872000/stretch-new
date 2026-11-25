/**
 * Loads the SMAX chat widget late: on the visitor's first interaction, or after
 * FALLBACK_MS if they only read.
 *
 * As a <script> in the page head it downloaded and ran its SDK (and the
 * requests that SDK makes) while the page was still rendering, for a bubble
 * nobody can use before they have at least moved the pointer.
 *
 * Waiting for `app:mounted` matters: SMAX rewrites the URL while it starts and
 * then restores the one it first saw, so it must not start before app.vue has
 * stripped the one-off `?auth=` flag from the address bar.
 */
const SDK_URL = 'https://chatbox.smax.ai/sdk.min.js'
const FALLBACK_MS = 10_000
const EVENTS = ['pointerdown', 'pointermove', 'touchstart', 'keydown', 'scroll', 'wheel'] as const

export default defineNuxtPlugin((nuxtApp) => {
  let loaded = false

  const load = () => {
    if (loaded) return
    loaded = true
    EVENTS.forEach(name => window.removeEventListener(name, load))

    // The SDK calls this as soon as it has evaluated, so define it first.
    ;(window as any).smAsyncInit = () => {
      (window as any).SM.init({
        page_pid: 'ctm6a827fa7f4ed6d532ceeb454',
        trigger_id: '6a82806628e2f4ae79767757',
        chat_type: 'PLUGIN',
        env: 'prod',
      })
    }
    const script = document.createElement('script')
    script.src = SDK_URL
    script.async = true
    document.body.appendChild(script)
  }

  nuxtApp.hook('app:mounted', () => {
    EVENTS.forEach(name => window.addEventListener(name, load, { once: true, passive: true }))
    setTimeout(load, FALLBACK_MS)
  })
})
