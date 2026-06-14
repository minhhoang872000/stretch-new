// Single source of truth for decoding the booking "wire format" that the
// website (and now the CRM "new booking" modal) send to the API.
//
// Wire shape:
//   service: a code, not a display name.
//     · personal  → recovery | pain | stiffness | not_sure
//     · business  → recovery | wellness | education | not_sure
//   note:    free text, optionally followed by a final line of
//            "Key: value | Key: value" markers:
//     · personal  → Location: <home|clinic|consult> | Contact: <call|zalo|email>
//     · business  → Participants: <n> | Setting: <indoor|outdoor> | Address: <..> | Role: <..>
//
// Keep every booking view (list, calendar, detail, modal) reading/writing
// through this module so the formats never drift apart again.

export const SERVICE_LABELS = {
  recovery: 'Phục hồi sau vận động',
  pain: 'Đau nhức / chấn thương',
  stiffness: 'Căng cứng kéo dài',
  wellness: 'Sức khỏe doanh nghiệp',
  education: 'Giáo dục & Đào tạo',
  not_sure: 'Tư vấn chung',
}

export const LOCATION_LABELS = {
  home: 'Tại nhà riêng',
  clinic: 'Tại cơ sở',
  consult: 'Tư vấn thêm',
}

export const CONTACT_LABELS = {
  call: 'Gọi điện',
  zalo: 'Zalo',
  email: 'Email',
}

export const SETTING_LABELS = {
  indoor: 'Trong nhà',
  outdoor: 'Ngoài trời',
}

export const TYPE_LABELS = {
  personal: 'Cá nhân',
  business: 'Doanh nghiệp',
}

export const STATUS_LABELS = {
  pending: 'Chờ xác nhận',
  confirmed: 'Đã xác nhận',
  completed: 'Hoàn thành',
  cancelled: 'Đã huỷ',
}

export function serviceLabel(code) {
  return SERVICE_LABELS[code] || code || ''
}

export function statusLabel(status) {
  return STATUS_LABELS[status] || status || '—'
}

export function serviceClass(service) {
  return {
    recovery: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
    pain: 'bg-red-50 text-red-700 border border-red-200',
    stiffness: 'bg-orange-50 text-orange-700 border border-orange-200',
    wellness: 'bg-teal-50 text-teal-700 border border-teal-200',
    education: 'bg-indigo-50 text-indigo-700 border border-indigo-200',
    not_sure: 'bg-purple-50 text-purple-700 border border-purple-200',
  }[service] || 'bg-surface-container text-on-surface-variant border border-outline-variant/20'
}

export function statusClass(status) {
  return {
    pending: 'bg-yellow-50 text-yellow-700 border border-yellow-200',
    confirmed: 'bg-blue-50 text-blue-700 border border-blue-200',
    completed: 'bg-green-50 text-green-700 border border-green-200',
    cancelled: 'bg-red-50 text-red-400 border border-red-200',
  }[status] || 'bg-surface-container text-on-surface-variant'
}

export function contactClass(pref) {
  return {
    call: 'bg-sky-50 text-sky-700',
    zalo: 'bg-blue-50 text-blue-700',
    email: 'bg-indigo-50 text-indigo-700',
  }[pref] || 'bg-surface-container text-on-surface-variant'
}

export function locationIcon(loc) {
  return { home: 'home', clinic: 'apartment', consult: 'chat' }[loc] || 'location_on'
}

export function contactIcon(pref) {
  return { call: 'call', zalo: 'message', email: 'email' }[pref] || 'contact_phone'
}

const MARKER_KEYS = ['Type', 'Location', 'Contact', 'Participants', 'Setting', 'Address', 'Role']

/**
 * Split a note into its free text and the structured marker fields.
 * Recognises both the personal (Location/Contact) and business
 * (Participants/Setting/Address/Role) marker lines.
 *
 * @returns {{ text, location, contact, participants, setting, address, role, extra }}
 */
export function parseNote(raw) {
  const empty = {
    text: '', type: '', location: '', contact: '', participants: '',
    setting: '', address: '', role: '', extra: {},
  }
  if (!raw) return empty

  const lines = String(raw).split('\n')
  const lastLine = lines[lines.length - 1] || ''
  const isMarkerLine = MARKER_KEYS.some((k) => lastLine.includes(`${k}:`))
  if (!isMarkerLine) return { ...empty, text: String(raw).trim() }

  const extra = {}
  lastLine.split('|').forEach((part) => {
    const m = part.match(/^\s*([A-Za-z]+)\s*:\s*(.+?)\s*$/)
    if (m) extra[m[1].toLowerCase()] = m[2]
  })

  return {
    text: lines.slice(0, -1).join('\n').trim(),
    type: extra.type || '',
    location: extra.location || '',
    contact: extra.contact || '',
    participants: extra.participants || '',
    setting: extra.setting || '',
    address: extra.address || '',
    role: extra.role || '',
    extra,
  }
}

/**
 * Decide whether a booking is personal or business.
 * Prefers the explicit `Type:` marker (written by the CRM modal); otherwise
 * infers from the presence of business-only fields.
 *
 * @param {ReturnType<typeof parseNote>} parsed
 * @returns {'personal' | 'business'}
 */
export function bookingType(parsed) {
  if (parsed?.type === 'business' || parsed?.type === 'personal') return parsed.type
  if (parsed?.participants || parsed?.setting || parsed?.address || parsed?.role) return 'business'
  return 'personal'
}

/**
 * Build the wire-format note from the modal form's free text + structured
 * extras. Mirrors the website's "free text\nKey: value | Key: value" layout.
 *
 * @param {string} text  free-text note
 * @param {object} markers  e.g. { Location: 'home' } or { Participants: 50, Setting: 'indoor' }
 */
export function buildNote(text, markers = {}) {
  const markerLine = Object.entries(markers)
    .filter(([, v]) => v !== '' && v !== null && v !== undefined)
    .map(([k, v]) => `${k}: ${v}`)
    .join(' | ')
  return [String(text || '').trim(), markerLine].filter(Boolean).join('\n')
}
