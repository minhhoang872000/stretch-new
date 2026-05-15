interface Notification {
  id: number
  message: string
  type: 'success' | 'error' | 'info'
  duration: number
}

const notifications = ref<Notification[]>([])
let idCounter = 0

export function useNotification() {
  function notify(message: string, type: Notification['type'] = 'info', duration = 4000) {
    const id = ++idCounter
    notifications.value.push({ id, message, type, duration })

    setTimeout(() => {
      dismiss(id)
    }, duration)
  }

  function dismiss(id: number) {
    notifications.value = notifications.value.filter(n => n.id !== id)
  }

  return {
    notifications: readonly(notifications),
    notify,
    dismiss,
  }
}
