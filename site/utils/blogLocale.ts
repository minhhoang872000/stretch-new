/**
 * Does a CMS post carry a real English translation?
 *
 * The CMS always fills `titleEn`/`contentEn`, but for some posts the editor
 * pasted the Vietnamese text into the English fields. Serving those at the
 * English URL made every such post a duplicate of its `/vi` twin, with an
 * hreflang `en-US` pointing at Vietnamese text — Google then indexes one and
 * drops the other.
 *
 * Translated means: an English title without Vietnamese-only letters (a title
 * may legitimately equal the Vietnamese one — "HUSTLE COMPETITION 2026"), and,
 * when the bodies are present, an English body that exists, is not a copy of
 * the Vietnamese one and is not mostly Vietnamese. Listings run in summary mode
 * without bodies, so only the title test applies there; for every current post
 * it gives the same answer as the full test.
 */
const VIETNAMESE_LETTERS = /[ăâđêôơưạảấầẩẫậắằẳẵặẹẻẽếềểễệỉịọỏốồổỗộớờởỡợụủứừửữựỳỵỷỹ]/gi

function bodyText(sections: unknown): string {
  if (!Array.isArray(sections)) return ''
  return sections
    .map((s: any) => String(s?.text || ''))
    .join('\n')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&[a-z#0-9]+;/gi, ' ')
    .trim()
}

function vietnameseShare(text: string): number {
  const letters = text.replace(/[^\p{L}]/gu, '').length
  if (!letters) return 0
  return (text.match(VIETNAMESE_LETTERS)?.length || 0) / letters
}

export function postHasEnglish(p: any): boolean {
  const titleEn = String(p?.titleEn || '').trim()
  if (!titleEn || vietnameseShare(titleEn) > 0) return false
  const en = bodyText(p?.contentEn)
  const vi = bodyText(p?.contentVi)
  if (vi && !en) return false
  if (en && vi && en === vi) return false
  // Untranslated posts measure 10-23% Vietnamese-only letters; translated ones
  // quoting a few Vietnamese names stay under 1%.
  if (en && vietnameseShare(en) > 0.02) return false
  return true
}
