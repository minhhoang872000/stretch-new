import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useLoadingStore = defineStore('loading', () => {
  const progress = ref(0)
  const active = ref(false)
  let _pending = 0
  let _timer = null
  let _routerActive = false

  function _startBar() {
    if (active.value) return
    active.value = true
    progress.value = 15
    clearTimeout(_timer)
    _timer = setTimeout(() => { if (active.value) progress.value = 45 }, 200)
    _timer = setTimeout(() => { if (active.value) progress.value = 72 }, 600)
  }

  function _finishBar() {
    clearTimeout(_timer)
    progress.value = 100
    _timer = setTimeout(() => {
      active.value = false
      progress.value = 0
    }, 350)
  }

  // ── Router navigation ──────────────────────────────────────────
  function routerStart() {
    _routerActive = true
    _startBar()
  }

  function routerFinish() {
    _routerActive = false
    if (_pending === 0) _finishBar()
  }

  // ── API requests (concurrent-safe counter) ─────────────────────
  function apiStart() {
    _pending++
    _startBar()
  }

  function apiFinish() {
    _pending = Math.max(0, _pending - 1)
    if (_pending === 0 && !_routerActive) _finishBar()
  }

  return { progress, active, routerStart, routerFinish, apiStart, apiFinish }
})
