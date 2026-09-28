/**
 * The Google sign-in outcome carried in `?auth=`, captured before the router
 * rewrites the URL (see plugins/00.auth-flag.client.ts) and consumed once by
 * app.vue.
 *
 * A plain module variable on purpose, not `useState`: a prerendered page ships
 * a payload in which that state is `null`, and reviving the payload could land
 * after the plugin wrote the flag and silently wipe it.
 */
export type AuthFlag = 'ok' | 'registered' | 'failed'

let pending: AuthFlag | null = null

export function setAuthFlag(flag: AuthFlag | null) {
  pending = flag
}

/** Returns the flag once, then forgets it. */
export function takeAuthFlag(): AuthFlag | null {
  const flag = pending
  pending = null
  return flag
}
