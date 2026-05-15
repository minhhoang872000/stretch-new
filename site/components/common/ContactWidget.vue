<script setup lang="ts">
const { t } = useI18n()
const { isOpen, toggleContact, closeContact } = useContact()
const isVisible = ref(false)
const widgetRef = ref<HTMLElement | null>(null)

// Dragging state
const position = ref({ x: 24, y: 24 }) // Default bottom-right offset
const isDragging = ref(false)
const dragOffset = ref({ x: 0, y: 0 })
const hasMoved = ref(false)
const startPos = ref({ x: 0, y: 0 })

// Shake state
const isShaking = ref(false)

const contactItems = computed(() => [
  {
    key: 'zalo',
    label: t('contact_widget.zalo'),
    href: 'http://zalo.me/4237229823551208502?src=qr&f=1',
    color: '#0068FF',
    icon: 'zalo',
  },
  {
    key: 'messenger',
    label: t('contact_widget.messenger'),
    href: 'https://www.facebook.com/share/1c3ffE4Wir/?mibextid=wwXIfr',
    color: '#0084FF',
    icon: 'messenger',
  },
  {
    key: 'whatsapp',
    label: t('contact_widget.whatsapp'),
    href: 'https://wa.me/84938713498',
    color: '#25D366',
    icon: 'whatsapp',
  },
  {
    key: 'phone',
    label: t('contact_widget.phone'),
    sublabel: '093 871 3498',
    href: 'tel:+84938713498',
    color: '#0B2A4A',
    icon: 'phone',
  },
])

function handleClickOutside(e: MouseEvent) {
  if (widgetRef.value && !widgetRef.value.contains(e.target as Node)) {
    closeContact()
  }
}

function handleScroll() {
  const scrollPercent = window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)
  isVisible.value = scrollPercent > 0.05 || window.scrollY > 100
}

// Dragging logic
function startDrag(e: MouseEvent | TouchEvent) {
  if (isOpen.value) return 

  isDragging.value = true
  hasMoved.value = false
  
  const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX
  const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY
  
  startPos.value = { x: clientX, y: clientY }

  const rect = widgetRef.value?.getBoundingClientRect()
  if (rect) {
    dragOffset.value = {
      x: clientX - rect.left,
      y: clientY - rect.top
    }
  }

  window.addEventListener('mousemove', onDrag)
  window.addEventListener('mouseup', stopDrag)
  window.addEventListener('touchmove', onDrag)
  window.addEventListener('touchend', stopDrag)
}

function onDrag(e: MouseEvent | TouchEvent) {
  if (!isDragging.value) return

  const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX
  const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY

  // Threshold for dragging
  if (Math.abs(clientX - startPos.value.x) > 5 || Math.abs(clientY - startPos.value.y) > 5) {
    hasMoved.value = true
  }

  if (!hasMoved.value) return

  // Calculate position from bottom-right
  const x = window.innerWidth - (clientX - dragOffset.value.x + 56)
  const y = window.innerHeight - (clientY - dragOffset.value.y + 56)

  // Bounds
  const safeX = Math.max(16, Math.min(x, window.innerWidth - 72))
  const safeY = Math.max(16, Math.min(y, window.innerHeight - 72))

  position.value = { x: safeX, y: safeY }
}

function stopDrag() {
  setTimeout(() => {
    isDragging.value = false
  }, 50)
  window.removeEventListener('mousemove', onDrag)
  window.removeEventListener('mouseup', stopDrag)
  window.removeEventListener('touchmove', onDrag)
  window.removeEventListener('touchend', stopDrag)
}

function onFabClick() {
  if (hasMoved.value) return
  toggleContact()
}

// Periodic shake
let shakeInterval: any = null
function triggerShake() {
  if (isOpen.value) return
  isShaking.value = true
  setTimeout(() => {
    isShaking.value = false
  }, 1000)
}

onMounted(() => {
  window.addEventListener('scroll', handleScroll, { passive: true })
  document.addEventListener('click', handleClickOutside)
  handleScroll()

  // Increased frequency: every 3 seconds
  shakeInterval = setInterval(triggerShake, 3000)
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
  document.removeEventListener('click', handleClickOutside)
  if (shakeInterval) clearInterval(shakeInterval)
})
</script>

<template>
  <Transition name="widget-fab">
    <div
      v-if="isVisible"
      ref="widgetRef"
      class="fixed z-50 flex flex-col items-end"
      :style="{
        right: `${position.x}px`,
        bottom: `${position.y}px`,
        transition: isDragging ? 'none' : 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)'
      }"
    >
      <!-- Menu Panel -->
      <Transition name="widget-menu">
        <div
          v-if="isOpen"
          class="mb-4 bg-white rounded-2xl shadow-elevated border border-border-default overflow-hidden w-[260px] sm:w-[280px]"
        >
          <div class="p-2">
            <a
              v-for="item in contactItems"
              :key="item.key"
              :href="item.href"
              target="_blank"
              rel="noopener noreferrer"
              class="flex items-center gap-3.5 px-4 py-3 rounded-xl hover:bg-off-white transition-colors group"
            >
              <!-- Icon -->
              <div
                class="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 text-white"
                :style="{ backgroundColor: item.color }"
              >
                <!-- Zalo -->
                <template v-if="item.icon === 'zalo'">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C6.48 2 2 6.04 2 11c0 2.83 1.34 5.35 3.44 7.05L4.5 21.5l3.65-1.85C9.3 19.88 10.63 20 12 20c5.52 0 10-4.04 10-9S17.52 2 12 2zm4.5 6.5H9.5c-.28 0-.5-.22-.5-.5s.22-.5.5-.5h7c.28 0 .5.22.5.5s-.22.5-.5.5zm0 3H9.5c-.28 0-.5-.22-.5-.5s.22-.5.5-.5h7c.28 0 .5.22.5.5s-.22.5-.5.5zm-3 3H9.5c-.28 0-.5-.22-.5-.5s.22-.5.5-.5h4c.28 0 .5.22.5.5s-.22.5-.5.5z"/>
                  </svg>
                </template>
                <!-- Messenger -->
                <template v-else-if="item.icon === 'messenger'">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C6.36 2 2 6.13 2 11.7c0 2.91 1.2 5.42 3.15 7.15V22l3.04-1.67c.81.23 1.68.35 2.58.35h.23c5.64 0 10-4.13 10-9.68S17.64 2 12 2zm1.08 13.04l-2.55-2.73L5.5 15.04l5.52-5.86 2.62 2.73L18.5 9.04l-5.42 6z"/>
                  </svg>
                </template>
                <!-- WhatsApp -->
                <template v-else-if="item.icon === 'whatsapp'">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                </template>
                <!-- Phone -->
                <template v-else>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                  </svg>
                </template>
              </div>

              <!-- Text -->
              <div class="flex-1 min-w-0">
                <span class="text-sm font-heading font-semibold text-navy block leading-tight">
                  {{ item.label }}
                </span>
                <span v-if="item.sublabel" class="text-xs text-text-secondary">
                  {{ item.sublabel }}
                </span>
              </div>

              <!-- Arrow -->
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-text-secondary/40 group-hover:text-navy/60 transition-colors flex-shrink-0">
                <path d="M5 11l4-4-4-4"/>
              </svg>
            </a>
          </div>
        </div>
      </Transition>

      <!-- FAB Button -->
      <button
        @mousedown="startDrag"
        @touchstart="startDrag"
        @click.stop="onFabClick"
        class="w-14 h-14 rounded-full shadow-elevated flex items-center justify-center transition-all duration-200 ml-auto touch-none"
        :class="[
          isOpen
            ? 'bg-navy/90 hover:bg-navy text-white'
            : 'bg-accent hover:bg-accent-dark text-white hover:scale-105',
          isShaking && !isOpen ? 'shake' : ''
        ]"
        :aria-label="isOpen ? 'Close contact menu' : 'Open contact menu'"
      >
        <!-- Chat icon (closed state) -->
        <Transition name="icon-swap" mode="out-in">
          <svg v-if="!isOpen" key="chat" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
          </svg>
          <!-- X icon (open state) -->
          <svg v-else key="close" width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
            <line x1="4" y1="4" x2="18" y2="18"/>
            <line x1="18" y1="4" x2="4" y2="18"/>
          </svg>
        </Transition>
      </button>
    </div>
  </Transition>
</template>

<style scoped>
/* Shake Animation - More intense */
@keyframes shake {
  0% { transform: rotate(0deg) scale(1); }
  5% { transform: rotate(-15deg) scale(1.1); }
  10% { transform: rotate(15deg) scale(1.1); }
  15% { transform: rotate(-15deg) scale(1.1); }
  20% { transform: rotate(15deg) scale(1.1); }
  25% { transform: rotate(0deg) scale(1); }
  100% { transform: rotate(0deg) scale(1); }
}
.shake {
  animation: shake 1s cubic-bezier(0.36, 0.07, 0.19, 0.97) both;
}

/* FAB appear */
.widget-fab-enter-active {
  transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}
.widget-fab-leave-active {
  transition: all 0.25s ease;
}
.widget-fab-enter-from {
  opacity: 0;
  transform: scale(0.8) translateY(20px);
}
.widget-fab-leave-to {
  opacity: 0;
  transform: scale(0.8) translateY(20px);
}

/* Menu panel */
.widget-menu-enter-active {
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
}
.widget-menu-leave-active {
  transition: all 0.15s ease;
}
.widget-menu-enter-from {
  opacity: 0;
  transform: translateY(12px) scale(0.95);
}
.widget-menu-leave-to {
  opacity: 0;
  transform: translateY(8px) scale(0.98);
}

/* Icon swap */
.icon-swap-enter-active,
.icon-swap-leave-active {
  transition: all 0.15s ease;
}
.icon-swap-enter-from {
  opacity: 0;
  transform: rotate(-90deg) scale(0.5);
}
.icon-swap-leave-to {
  opacity: 0;
  transform: rotate(90deg) scale(0.5);
}
</style>

