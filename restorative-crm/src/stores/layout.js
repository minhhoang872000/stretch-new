import { defineStore } from 'pinia'
import { ref, watch } from 'vue'

const RAIL_KEY = 'stretch-admin-rail'
const GROUPS_KEY = 'stretch-admin-nav-groups'

/**
 * Shell state: the mobile drawer, the desktop icon rail, which nav groups are
 * folded, and whether the command palette is open.
 *
 * Rail and folded groups persist — an admin who works out of two modules
 * should not have to re-fold the other six on every visit.
 */
export const useLayoutStore = defineStore('layout', () => {
  const isSidebarOpen = ref(false)
  const isRail = ref(localStorage.getItem(RAIL_KEY) === '1')
  const collapsedGroups = ref(readGroups())
  const isPaletteOpen = ref(false)

  function readGroups() {
    try {
      const raw = localStorage.getItem(GROUPS_KEY)
      return raw ? JSON.parse(raw) : []
    } catch {
      return []
    }
  }

  watch(isRail, (value) => localStorage.setItem(RAIL_KEY, value ? '1' : '0'))
  watch(
    collapsedGroups,
    (value) => localStorage.setItem(GROUPS_KEY, JSON.stringify(value)),
    { deep: true },
  )

  const toggleSidebar = () => { isSidebarOpen.value = !isSidebarOpen.value }
  const closeSidebar = () => { isSidebarOpen.value = false }
  const toggleRail = () => { isRail.value = !isRail.value }

  function toggleGroup(id) {
    const i = collapsedGroups.value.indexOf(id)
    if (i === -1) collapsedGroups.value.push(id)
    else collapsedGroups.value.splice(i, 1)
  }

  const isGroupCollapsed = (id) => collapsedGroups.value.includes(id)

  const openPalette = () => { isPaletteOpen.value = true }
  const closePalette = () => { isPaletteOpen.value = false }
  const togglePalette = () => { isPaletteOpen.value = !isPaletteOpen.value }

  return {
    isSidebarOpen, toggleSidebar, closeSidebar,
    isRail, toggleRail,
    collapsedGroups, toggleGroup, isGroupCollapsed,
    isPaletteOpen, openPalette, closePalette, togglePalette,
  }
})
