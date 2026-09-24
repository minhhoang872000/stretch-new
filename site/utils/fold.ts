/**
 * Search-folding for Vietnamese: strip tone marks, map đ/Đ, lower-case.
 * Nobody types "Phục hồi" with every mark into a search box in a hurry, so both
 * the query and the text it is matched against go through this first.
 */
export function fold(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase()
}
