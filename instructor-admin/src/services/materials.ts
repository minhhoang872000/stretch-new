import type { Attachment } from '~/types'
import { apiFetch } from '~/services/http'

/**
 * Lesson materials: upload one file and get back the attachment record the
 * lesson stores (`lesson.attachments`). The bytes go to the public R2 bucket
 * through `POST /materials/upload`; saving the course is what attaches it.
 */

export const MATERIAL_ACCEPT =
  '.pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt,.csv,.zip,.jpg,.jpeg,.png,.webp'

export const MATERIAL_MAX_MB = 25

export function uploadMaterial(file: File): Promise<Attachment> {
  const form = new FormData()
  form.append('file', file)
  return apiFetch<Attachment>('/materials/upload', { method: 'POST', body: form })
}

/** 1 234 567 → "1,2 MB". */
export function formatSize(bytes: number): string {
  if (!bytes) return ''
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`
  return `${(bytes / 1024 / 1024).toFixed(1).replace('.', ',')} MB`
}

/** "Bài 1.pdf" → "PDF". */
export function fileBadge(name: string): string {
  const ext = name.split('.').pop() || ''
  return ext.length <= 4 ? ext.toUpperCase() : 'FILE'
}
