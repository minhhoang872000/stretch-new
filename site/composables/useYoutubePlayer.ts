/**
 * A YouTube embed we can read the playhead off — the IFrame Player API rather
 * than a plain `<iframe>`.
 *
 * A plain embed is a black box: the page cannot tell whether a lesson was
 * watched. With the API the player reports `getCurrentTime()`/`getDuration()`,
 * which is what lets a lesson tick itself off near the end and reopen where it
 * stopped.
 *
 * The API script is fetched once per session, on the first play — never during
 * SSR and never on a lesson nobody watched.
 */

/** Values YouTube reports through `onStateChange`. */
export const YT_ENDED = 0
export const YT_PLAYING = 1
export const YT_PAUSED = 2

interface YtPlayer {
  getCurrentTime: () => number
  getDuration: () => number
  destroy: () => void
}

declare global {
  interface Window {
    YT?: { Player: new (el: HTMLElement, config: Record<string, unknown>) => YtPlayer }
    onYouTubeIframeAPIReady?: () => void
  }
}

/** One shared load, however many lessons get played. */
let apiPromise: Promise<void> | null = null

function loadApi(): Promise<void> {
  if (window.YT?.Player) return Promise.resolve()
  if (apiPromise) return apiPromise

  apiPromise = new Promise<void>((resolve) => {
    // Chain rather than overwrite: another embed on the page may be waiting on
    // this same global.
    const previous = window.onYouTubeIframeAPIReady
    window.onYouTubeIframeAPIReady = () => {
      previous?.()
      resolve()
    }
    const script = document.createElement('script')
    script.src = 'https://www.youtube.com/iframe_api'
    script.async = true
    document.head.appendChild(script)
  })

  return apiPromise
}

export function useYoutubePlayer() {
  const currentTime = ref(0)
  const duration = ref(0)
  const isPlaying = ref(false)
  const ended = ref(false)

  let player: YtPlayer | null = null
  let timer: ReturnType<typeof setInterval> | null = null

  /** 0–100 of the way through. 0 until the player reports a duration. */
  const percent = computed(() => (
    duration.value > 0 ? Math.min(100, Math.round((currentTime.value / duration.value) * 100)) : 0
  ))

  function readPlayhead() {
    if (!player) return
    // getDuration() is 0 until metadata arrives, so keep re-reading it.
    const d = player.getDuration()
    if (d > 0) duration.value = d
    currentTime.value = player.getCurrentTime()
  }

  function startTimer() {
    if (timer) return
    // Twice a second: fine-grained enough for a 90% threshold, cheap enough to
    // leave running for a 15-minute lesson.
    timer = setInterval(readPlayhead, 500)
  }

  function stopTimer() {
    if (!timer) return
    clearInterval(timer)
    timer = null
  }

  /**
   * Replaces `el` with the player and starts it. `start` seeks to a saved
   * position; the reported time is relative to the whole video either way.
   */
  async function mount(el: HTMLElement, videoId: string, start = 0) {
    destroy()
    await loadApi()
    if (!window.YT?.Player) return

    ended.value = false
    currentTime.value = start
    duration.value = 0

    player = new window.YT.Player(el, {
      videoId,
      // The API REPLACES `el` with its own iframe, so the placeholder's classes
      // (and the scoped-CSS attribute with them) are gone — without these the
      // iframe falls back to its default 640×360 and sits inside the frame at
      // the wrong size. The stylesheet also pins it via `:deep(iframe)`.
      width: '100%',
      height: '100%',
      // Same privacy-friendly host as the static embed used before.
      host: 'https://www.youtube-nocookie.com',
      playerVars: {
        autoplay: 1,
        // Keep "up next" inside this channel instead of sending a paying
        // learner off to somebody else's video.
        rel: 0,
        // `modestbranding` is NOT set: YouTube deprecated it on 2023-08-15 and
        // it has no effect. Nothing hides the title bar, the YouTube logo or the
        // "Watch on YouTube" button — a viewer can always reach the video's URL
        // from the player, which is why link secrecy cannot be a security
        // measure here. See server/utils/lessonVideos.ts.
        playsinline: 1,
        start: Math.max(0, Math.floor(start)),
        origin: window.location.origin,
      },
      events: {
        onReady: () => {
          readPlayhead()
          startTimer()
        },
        onStateChange: (event: { data: number }) => {
          isPlaying.value = event.data === YT_PLAYING
          if (event.data === YT_PLAYING) startTimer()
          if (event.data === YT_PAUSED) readPlayhead()
          if (event.data === YT_ENDED) {
            readPlayhead()
            // Snap to the end: the last poll can land a second short, and a
            // lesson that played to the end must read as fully watched.
            if (duration.value > 0) currentTime.value = duration.value
            ended.value = true
            stopTimer()
          }
        },
      },
    })
  }

  function destroy() {
    stopTimer()
    try {
      player?.destroy()
    } catch {
      // Already gone with its DOM node — nothing to clean up.
    }
    player = null
    isPlaying.value = false
  }

  onBeforeUnmount(destroy)

  return { mount, destroy, currentTime, duration, percent, isPlaying, ended }
}
