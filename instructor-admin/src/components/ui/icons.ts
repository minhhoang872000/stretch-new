/**
 * The console's icon set — inline SVG paths on a 24×24 stroke grid.
 *
 * No emoji anywhere in this app: an emoji renders differently per platform, has
 * no accessible name, and cannot inherit `currentColor`.
 */
export const ICON_PATHS = {
  dashboard:
    '<rect x="3" y="3" width="7.5" height="7.5" rx="1.5"/><rect x="13.5" y="3" width="7.5" height="7.5" rx="1.5"/><rect x="3" y="13.5" width="7.5" height="7.5" rx="1.5"/><rect x="13.5" y="13.5" width="7.5" height="7.5" rx="1.5"/>',
  book: '<path d="M4 5.5A1.5 1.5 0 0 1 5.5 4H19v16H5.5A1.5 1.5 0 0 1 4 18.5z"/><line x1="8" y1="4" x2="8" y2="20"/>',
  video: '<rect x="3" y="6" width="13" height="12" rx="2"/><path d="M16 10.5 21 8v8l-5-2.5z"/>',
  calendar:
    '<rect x="3" y="5" width="18" height="16" rx="2"/><line x1="3" y1="10" x2="21" y2="10"/><line x1="8" y1="3" x2="8" y2="7"/><line x1="16" y1="3" x2="16" y2="7"/>',
  users:
    '<circle cx="9" cy="8" r="3.2"/><path d="M3 20c0-3.3 2.7-5.2 6-5.2s6 1.9 6 5.2"/><path d="M16 5.6a3.2 3.2 0 0 1 0 6.3M17.5 14.6c2 .7 3.5 2.3 3.5 4.6"/>',
  award: '<circle cx="12" cy="9" r="5.5"/><path d="M8.5 13.8 7 21l5-2.5L17 21l-1.5-7.2"/>',
  star: '<polygon points="12 3 14.9 9.2 21.5 10 16.7 14.7 18 21.2 12 18 6 21.2 7.3 14.7 2.5 10 9.1 9.2"/>',
  chart:
    '<line x1="4" y1="20" x2="20" y2="20"/><rect x="6" y="12" width="3.2" height="6" rx="1"/><rect x="11" y="8" width="3.2" height="10" rx="1"/><rect x="16" y="4" width="3.2" height="14" rx="1"/>',
  plus: '<line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>',
  check: '<polyline points="5 12.5 9.5 17 19 7"/>',
  x: '<line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>',
  chevronDown: '<polyline points="6 9.5 12 15.5 18 9.5"/>',
  chevronRight: '<polyline points="9 6 15 12 9 18"/>',
  chevronLeft: '<polyline points="15 6 9 12 15 18"/>',
  search: '<circle cx="11" cy="11" r="7"/><line x1="16.5" y1="16.5" x2="21" y2="21"/>',
  trash: '<path d="M4 7h16M9 7V4.5h6V7M6 7l1 13h10l1-13"/>',
  drag: '<circle cx="9" cy="6" r="1.3"/><circle cx="9" cy="12" r="1.3"/><circle cx="9" cy="18" r="1.3"/><circle cx="15" cy="6" r="1.3"/><circle cx="15" cy="12" r="1.3"/><circle cx="15" cy="18" r="1.3"/>',
  upload:
    '<path d="M12 16V4"/><polyline points="7 9 12 4 17 9"/><path d="M4 16v2.5A1.5 1.5 0 0 0 5.5 20h13a1.5 1.5 0 0 0 1.5-1.5V16"/>',
  warning:
    '<path d="M12 4 2.8 20h18.4z"/><line x1="12" y1="10" x2="12" y2="15"/><circle cx="12" cy="17.6" r="0.9" fill="currentColor" stroke="none"/>',
  info: '<circle cx="12" cy="12" r="9"/><line x1="12" y1="11" x2="12" y2="16.5"/><circle cx="12" cy="7.8" r="0.9" fill="currentColor" stroke="none"/>',
  clock: '<circle cx="12" cy="12" r="9"/><polyline points="12 7 12 12 15.5 14"/>',
  doc: '<path d="M6 3h9l4 4v14H6z"/><line x1="9" y1="12" x2="16" y2="12"/><line x1="9" y1="16" x2="14" y2="16"/>',
  quiz: '<rect x="4" y="4" width="16" height="16" rx="3"/><polyline points="8 12 10.5 14.5 16 9"/>',
  logout:
    '<path d="M14 5H6.5A1.5 1.5 0 0 0 5 6.5v11A1.5 1.5 0 0 0 6.5 19H14"/><polyline points="16 8 20 12 16 16"/><line x1="10" y1="12" x2="20" y2="12"/>',
  eye: '<path d="M2.5 12S6 6 12 6s9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6z"/><circle cx="12" cy="12" r="2.6"/>',
  eyeOff:
    '<path d="M4 4l16 16"/><path d="M9.5 5.4A9.9 9.9 0 0 1 12 5c6 0 9.5 7 9.5 7a17 17 0 0 1-2.7 3.6M6.6 7.3A17 17 0 0 0 2.5 12s3.5 7 9.5 7c1 0 2-.2 2.9-.5"/>',
  download:
    '<path d="M12 4v12"/><polyline points="7 11 12 16 17 11"/><path d="M4 18v1.5A1.5 1.5 0 0 0 5.5 21h13a1.5 1.5 0 0 0 1.5-1.5V18"/>',
  menu: '<line x1="4" y1="6" x2="20" y2="6"/><line x1="4" y1="12" x2="20" y2="12"/><line x1="4" y1="18" x2="20" y2="18"/>',
  link: '<path d="M9.5 14.5 14.5 9.5"/><path d="M11 7.5 13 5.5a3.5 3.5 0 0 1 5 5l-2 2"/><path d="M13 16.5 11 18.5a3.5 3.5 0 0 1-5-5l2-2"/>',
  pencil: '<path d="M4 20h4l10-10-4-4L4 16z"/><path d="M13.5 6.5 17.5 10.5"/>',
  table: '<rect x="3" y="4" width="18" height="16" rx="2"/><line x1="3" y1="9.5" x2="21" y2="9.5"/><line x1="9.5" y1="9.5" x2="9.5" y2="20"/>',
} as const

export type IconName = keyof typeof ICON_PATHS
