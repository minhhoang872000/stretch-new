/**
 * Learning Hub auth modal — shared open/close state.
 *
 * `useState` rather than module-level refs: module scope is shared across
 * requests on the server, so a ref here would leak one visitor's open modal
 * into the next visitor's rendered HTML.
 */

export type AuthView = 'login' | 'register' | 'forgot' | 'sent'

const VIEWS: AuthView[] = ['login', 'register', 'forgot', 'sent']

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

  /**
   * `?auth=login|register|forgot|sent` opens the modal on load, so password
   * reset emails and campaign links can deep-link straight into a pane.
   */
  function openFromQuery(value: unknown) {
    const wanted = String(value ?? '')
    if ((VIEWS as string[]).includes(wanted)) open(wanted as AuthView)
  }

  return { isOpen, view, open, close, go, openFromQuery }
}
