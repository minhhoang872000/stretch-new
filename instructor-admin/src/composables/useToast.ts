import { readonly, ref } from 'vue'

export interface Toast {
  id: number
  message: string
  tone: 'good' | 'bad' | 'info'
}

const items = ref<Toast[]>([])
let counter = 0

/**
 * Feedback after every write. The skill's Forms & Feedback rule is that an action
 * must confirm itself — a save with no acknowledgement reads as a failure.
 */
export function useToast() {
  function push(message: string, tone: Toast['tone'] = 'good', ms = 3200) {
    const id = ++counter
    items.value = [...items.value, { id, message, tone }]
    setTimeout(() => dismiss(id), ms)
  }

  function dismiss(id: number) {
    items.value = items.value.filter((t) => t.id !== id)
  }

  return { toasts: readonly(items), push, dismiss }
}
