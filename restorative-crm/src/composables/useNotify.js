import { useToast } from 'primevue/usetoast'
import i18n from '@/i18n/index.js'

/**
 * Thin wrapper around PrimeVue's Toast that gives short success/error/info/warn
 * helpers with i18n-aware messages.
 *
 * Each helper accepts either an i18n key (e.g. 'toast.blogCreated') or a plain
 * string (e.g. a caught error message). If the argument is a known key it is
 * translated; otherwise it is shown as-is. The localized severity title (e.g.
 * "Thành công" / "Success") is used as the toast summary automatically.
 *
 * Must be called from a component's setup() (PrimeVue's useToast uses inject).
 */
export function useNotify() {
  const toast = useToast()
  const { t, te } = i18n.global

  // Translate when the message is a registered key, else show the literal text.
  const tr = (msg) => (typeof msg === 'string' && te(msg) ? t(msg) : msg)

  const show = (severity, message, life) =>
    toast.add({
      severity,
      summary: t(`toast.${severity}`),
      detail: tr(message),
      life,
    })

  return {
    success: (message) => show('success', message, 3000),
    error: (message) => show('error', message || 'toast.genericError', 5000),
    info: (message) => show('info', message, 3000),
    warn: (message) => show('warn', message, 4000),
  }
}
