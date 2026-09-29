import type { Ref, WatchSource } from 'vue'
import type { SwiperOptions } from 'swiper/types'
import type SwiperType from 'swiper'

/**
 * Mounts Swiper (core, v12) on an element Vue already rendered.
 *
 * Swiper 12 no longer ships Vue components, so the markup is plain
 * `.swiper > .swiper-wrapper > .swiper-slide` rendered by the template — which
 * also means the slides are in the server HTML (SEO, no layout shift) — and
 * Swiper takes over in the browser only.
 *
 * - Initialises when the element exists (also if it appears later, e.g. after
 *   a v-if on loaded data) and is destroyed on unmount.
 * - `slides`: pass the reactive list behind the slides; Swiper is updated
 *   (or rebuilt, in loop mode) when it changes.
 * - `prefers-reduced-motion`: autoplay dropped, transitions instant.
 *
 * Returns the instance (for custom arrows), the real (loop-aware) index and
 * whether the first / last slide is showing (for disabling arrows).
 */
export function useSwiper(
  el: Ref<HTMLElement | null>,
  options: () => SwiperOptions,
  slides?: WatchSource<unknown>,
) {
  const swiper = shallowRef<SwiperType | null>(null)
  const activeIndex = ref(0)
  const isBeginning = ref(true)
  const isEnd = ref(false)

  function sync(s: SwiperType) {
    activeIndex.value = s.realIndex
    isBeginning.value = s.isBeginning
    isEnd.value = s.isEnd
  }

  async function init() {
    if (!import.meta.client || !el.value) return
    swiper.value?.destroy(true, true)
    const { default: Swiper } = await import('swiper')
    if (!el.value) return
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const opts = options()
    const instance = new Swiper(el.value, {
      ...opts,
      ...(reduced ? { autoplay: false, speed: 0 } : {}),
      on: {
        ...(opts.on || {}),
        init: sync,
        slideChange: sync,
        reachBeginning: sync,
        reachEnd: sync,
        fromEdge: sync,
        resize: sync,
      },
    })
    swiper.value = instance
    sync(instance)
  }

  onMounted(init)
  // The element can appear after mount (v-if on data that loads later).
  watch(el, (now, before) => {
    if (now && now !== before) nextTick(init)
  })
  if (slides) {
    watch(slides, () =>
      nextTick(() => {
        if (!swiper.value) return init()
        // Loop mode keeps its own slide order; rebuild rather than patch it.
        if (swiper.value.params.loop) return init()
        swiper.value.update()
        sync(swiper.value)
      }),
    )
  }

  onBeforeUnmount(() => {
    swiper.value?.destroy(true, true)
    swiper.value = null
  })

  return { swiper, activeIndex, isBeginning, isEnd }
}
