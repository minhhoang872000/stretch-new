/** The language a visitor picked in the header ('en' | 'vi'), kept for a year. */
export const LOCALE_COOKIE = 'stretch_locale'

export function rememberLocale(code: string) {
  useCookie(LOCALE_COOKIE, { maxAge: 60 * 60 * 24 * 365, path: '/', sameSite: 'lax' }).value = code
}
