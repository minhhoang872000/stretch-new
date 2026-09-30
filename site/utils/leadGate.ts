/**
 * Whether this browser already left an email for free materials. One form per
 * visitor, not one per file: asking again for every download reads as a toll.
 */
const KEY = 'stretch:lead-email'

export function rememberLead(email: string) {
  try {
    localStorage.setItem(KEY, email)
  } catch {
    // storage blocked — they will simply be asked again next time
  }
}

export function hasLead(): boolean {
  try {
    return !!localStorage.getItem(KEY)
  } catch {
    return false
  }
}
