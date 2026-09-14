import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import {
  acceptMentorship,
  cancelMentorship,
  completeMentorship,
  declineMentorship,
  deleteMentorship,
  fetchMentorshipCalendar,
  fetchMentorshipHours,
  fetchMentorshipSessions,
  saveMentorshipHours,
} from '@/services/api.js'
import { useAuthStore } from '@/stores/auth.js'

/**
 * 1-to-1 mentorship requests from the Learning Hub.
 *
 * Unlike most of the academy screens, this one is real: the rows come from
 * Postgres and accepting one writes to Google Calendar. So it must not run on a
 * demo session — the mock sign-in has no API token, and every call would 401
 * and bounce the user back to the login page.
 */
export const useMentorshipStore = defineStore('mentorship', () => {
  const auth = useAuthStore()

  const sessions = ref([])
  const hours = ref([])
  const events = ref([])
  const integration = ref(null)

  const loading = ref(false)
  const loadingCalendar = ref(false)
  const savingId = ref('')
  const error = ref('')
  /** True while signed in with the mock fallback — the API is unreachable then. */
  const offline = computed(() => auth.isDemo)

  const pendingCount = computed(() => sessions.value.filter((s) => s.status === 'pending').length)
  const upcoming = computed(() => sessions.value.filter((s) => s.status === 'accepted'))
  const calendarConnected = computed(() => Boolean(integration.value?.configured))
  /** No domain-wide delegation → Meet links have to be pasted in by hand. */
  const needsManualLink = computed(
    () => Boolean(integration.value?.configured) && !integration.value?.delegated,
  )

  async function load(filters = {}) {
    if (offline.value) {
      sessions.value = []
      return
    }
    loading.value = true
    error.value = ''
    try {
      const data = await fetchMentorshipSessions(filters)
      sessions.value = data?.sessions ?? []
      if (data?.integration) integration.value = data.integration
    } catch (err) {
      error.value = err.message || 'Không tải được danh sách buổi 1-1.'
      sessions.value = []
    } finally {
      loading.value = false
    }
  }

  /** Cheap refresh used by the sidebar badge — no spinner, no error banner. */
  async function refreshBadge() {
    if (offline.value) return
    try {
      const data = await fetchMentorshipSessions({ status: 'pending' })
      const pending = data?.sessions ?? []
      // Only replace the list when nothing richer is loaded, so opening the page
      // then hitting the badge refresh does not throw the other rows away.
      if (!sessions.value.length) sessions.value = pending
      if (data?.integration) integration.value = data.integration
    } catch {
      /* the badge is not worth surfacing an error for */
    }
  }

  async function loadHours() {
    if (offline.value) return
    try {
      const data = await fetchMentorshipHours()
      hours.value = data?.hours ?? []
      if (data?.integration) integration.value = data.integration
    } catch (err) {
      error.value = err.message || 'Không tải được khung giờ.'
    }
  }

  async function saveHours(rows) {
    const data = await saveMentorshipHours(rows)
    hours.value = data?.hours ?? rows
    return data
  }

  async function loadCalendar(from, to) {
    if (offline.value) return
    loadingCalendar.value = true
    try {
      const data = await fetchMentorshipCalendar(from, to)
      events.value = data?.events ?? []
    } catch (err) {
      error.value = err.message || 'Không đọc được Google Calendar.'
      events.value = []
    } finally {
      loadingCalendar.value = false
    }
  }

  /** Replaces one row in place so the table does not jump after an action. */
  function put(session) {
    if (!session) return
    const i = sessions.value.findIndex((s) => s.id === session.id)
    if (i >= 0) sessions.value[i] = session
    else sessions.value.unshift(session)
  }

  async function accept(id, meetUrl = '') {
    savingId.value = id
    try {
      const data = await acceptMentorship(id, meetUrl)
      put(data?.session)
      return data
    } finally {
      savingId.value = ''
    }
  }

  async function decline(id, reason = '') {
    savingId.value = id
    try {
      const data = await declineMentorship(id, reason)
      put(data?.session)
      return data
    } finally {
      savingId.value = ''
    }
  }

  async function complete(id) {
    savingId.value = id
    try {
      const data = await completeMentorship(id)
      put(data?.session)
      return data
    } finally {
      savingId.value = ''
    }
  }

  async function cancel(id) {
    savingId.value = id
    try {
      const data = await cancelMentorship(id)
      put(data?.session)
      return data
    } finally {
      savingId.value = ''
    }
  }

  async function remove(id) {
    savingId.value = id
    try {
      await deleteMentorship(id)
      sessions.value = sessions.value.filter((s) => s.id !== id)
    } finally {
      savingId.value = ''
    }
  }

  return {
    sessions, hours, events, integration,
    loading, loadingCalendar, savingId, error, offline,
    pendingCount, upcoming, calendarConnected, needsManualLink,
    load, refreshBadge, loadHours, saveHours, loadCalendar,
    accept, decline, complete, cancel, remove,
  }
})
