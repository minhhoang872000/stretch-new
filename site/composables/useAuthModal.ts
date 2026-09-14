/**
 * Learning Hub auth modal — shared open/close state.
 *
 * `useState` rather than module-level refs: module scope is shared across
 * requests on the server, so a ref here would leak one visitor's open modal
 * into the next visitor's rendered HTML.
 *
 * Two panes, "login" and "register", both sign in with Google — the difference
 * is only the copy and the benefits rail, since Google makes sign-up and
 * sign-in the same event (see server/api/auth/google.get.ts).
 */

export type AuthView = 'login' | 'register'

const VIEWS: AuthView[] = ['login', 'register']

export function useAuthModal() {
  const isOpen = useState('auth-modal-open', () => false)
  const view = useState<AuthView>('auth-modal-view', () => 'login')

  function open(next: AuthView = 'login') {
    view.value = next
    isOpen.value = true
  }

  function close() {
    isOpen.value = false
  }

  /** Switch panes without closing — used by the cross-links inside the modal. */
  function go(next: AuthView) {
    view.value = next
  }

  /** `?auth=login|register` opens the modal on load, so campaign links can deep-link. */
  function openFromQuery(value: unknown) {
    const wanted = String(value ?? '')
    if ((VIEWS as string[]).includes(wanted)) open(wanted as AuthView)
  }

  return { isOpen, view, open, close, go, openFromQuery }
}
