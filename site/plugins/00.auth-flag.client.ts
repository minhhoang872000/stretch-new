import { setAuthFlag } from '~/utils/authFlag'

/**
 * Captures the Google sign-in outcome (`?auth=ok|registered|failed`, appended by
 * /api/auth/google) BEFORE the router gets to the URL.
 *
 * On a prerendered page — /, /vi/learning-hub …, exactly where the OAuth
 * callback usually lands — the router's initial navigation rewrites the address
 * to the build-time route and drops the query before any component mounts. By
 * `onMounted` the flag was gone, and the sign-in / sign-up toast never showed
 * in production. Plugins run before that navigation, so this is the last
 * moment the flag can still be read. app.vue announces it once mounted.
 */
export default defineNuxtPlugin({
  name: 'auth-flag',
  enforce: 'pre',
  setup() {
    const flag = new URLSearchParams(window.location.search).get('auth')
    if (flag === 'ok' || flag === 'registered' || flag === 'failed') setAuthFlag(flag)
  },
})
