<script setup lang="ts">
import reviewsData from '~/data/reviews.json'

interface Review {
  author: string
  avatar: string
  rating: number
  text: string
  time: string
  link: string
}

const reviews = (reviewsData.reviews || []) as Review[]

// Rating tổng hợp hiển thị ở header
const avgRating = computed(() => {
  if (!reviews.length) return 0
  const sum = reviews.reduce((s, r) => s + (r.rating || 0), 0)
  return Math.round((sum / reviews.length) * 10) / 10
})

// "06/01/2026 04:26:34" (MM/DD/YYYY) -> "DD/MM/YYYY"
function formatDate(time: string): string {
  if (!time) return ''
  const datePart = time.split(' ')[0]
  const [mm, dd, yyyy] = datePart.split('/')
  if (!yyyy) return datePart
  return `${dd}/${mm}/${yyyy}`
}

function initials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() || '')
    .join('')
}

// avatar Google đôi khi 403 -> fallback sang initials
const failed = ref<Set<number>>(new Set())
function onImgError(i: number) {
  failed.value = new Set(failed.value).add(i)
}

// ----- Carousel -----
const perView = ref(3)
const index = ref(0)
const isHovered = ref(false)
let timer: ReturnType<typeof setInterval> | null = null

const maxIndex = computed(() => Math.max(0, reviews.length - perView.value))
const trackStyle = computed(() => ({
  width: `${(reviews.length / perView.value) * 100}%`,
  transform: `translateX(-${index.value * (100 / reviews.length)}%)`,
}))
const slideStyle = computed(() => ({ width: `${100 / reviews.length}%` }))

function updatePerView() {
  if (typeof window === 'undefined') return
  const w = window.innerWidth
  perView.value = w < 640 ? 1 : w < 1024 ? 2 : 3
  if (index.value > maxIndex.value) index.value = maxIndex.value
}

function go(i: number) {
  if (i < 0) i = maxIndex.value
  else if (i > maxIndex.value) i = 0
  index.value = i
}
const next = () => go(index.value + 1)
const prev = () => go(index.value - 1)

// ----- Touch / swipe (mobile) -----
const touchStartX = ref(0)
const touchDeltaX = ref(0)
function onTouchStart(e: TouchEvent) {
  stopAuto()
  touchStartX.value = e.touches[0].clientX
  touchDeltaX.value = 0
}
function onTouchMove(e: TouchEvent) {
  touchDeltaX.value = e.touches[0].clientX - touchStartX.value
}
function onTouchEnd() {
  if (Math.abs(touchDeltaX.value) > 40) {
    if (touchDeltaX.value < 0) next()
    else prev()
  }
  touchDeltaX.value = 0
  if (reviews.length > perView.value) startAuto()
}

function startAuto() {
  stopAuto()
  timer = setInterval(() => {
    if (!isHovered.value) next()
  }, 5000)
}
function stopAuto() {
  if (timer) {
    clearInterval(timer)
    timer = null
  }
}

onMounted(() => {
  updatePerView()
  window.addEventListener('resize', updatePerView)
  if (reviews.length > perView.value) startAuto()
})
onUnmounted(() => {
  stopAuto()
  if (typeof window !== 'undefined') window.removeEventListener('resize', updatePerView)
})
</script>

<template>
  <section v-if="reviews.length" class="py-16 md:py-24 bg-off-white">
    <div class="section-container">
      <!-- Header -->
      <div class="flex flex-col items-center text-center mb-10 lg:mb-14">
        <span class="text-xs font-heading font-extrabold text-[#F9531E] uppercase tracking-widest mb-3">
          {{ $t('reviews.eyebrow') }}
        </span>
        <h2 class="text-2xl md:text-[34px] font-heading font-extrabold text-[#0B2A4A] leading-tight mb-4 tracking-tight">
          {{ $t('reviews.title') }}
        </h2>

        <!-- Google rating summary -->
        <div class="inline-flex items-center gap-3 bg-white border border-slate-200/80 rounded-full pl-4 pr-5 py-2 shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
          <!-- Google G -->
          <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1Z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.99.66-2.26 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23Z" />
            <path fill="#FBBC05" d="M5.84 14.1a6.6 6.6 0 0 1 0-4.2V7.06H2.18a11 11 0 0 0 0 9.88l3.66-2.84Z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38Z" />
          </svg>
          <div class="flex items-center gap-2">
            <span class="text-lg font-heading font-extrabold text-[#0B2A4A] leading-none">{{ avgRating.toFixed(1) }}</span>
            <div class="flex" aria-hidden="true">
              <svg v-for="s in 5" :key="s" width="15" height="15" viewBox="0 0 24 24" fill="#FBBC05">
                <path d="M12 2l2.9 6.26L21.5 9l-5 4.6L18 21l-6-3.2L6 21l1.5-7.4-5-4.6 6.6-.74L12 2z" />
              </svg>
            </div>
          </div>
          <!-- <span class="text-[13px] text-[#334155] border-l border-slate-200 pl-3">
            {{ reviews.length }} {{ $t('reviews.count_label') }}
          </span> -->
        </div>
      </div>

      <!-- Carousel -->
      <div
        class="relative"
        @mouseenter="isHovered = true"
        @mouseleave="isHovered = false"
      >
        <div
          class="overflow-hidden"
          @touchstart.passive="onTouchStart"
          @touchmove.passive="onTouchMove"
          @touchend.passive="onTouchEnd"
        >
          <div
            class="flex transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]"
            :style="trackStyle"
          >
            <div
              v-for="(r, i) in reviews"
              :key="i"
              class="px-2.5 md:px-3 flex-shrink-0"
              :style="slideStyle"
            >
              <div class="h-full bg-white border border-slate-200/60 rounded-2xl p-6 shadow-[0_4px_15px_rgba(0,0,0,0.005)] flex flex-col">
                <!-- stars -->
                <div class="flex gap-0.5 mb-4" aria-hidden="true">
                  <svg v-for="s in 5" :key="s" width="16" height="16" viewBox="0 0 24 24" :fill="s <= r.rating ? '#FBBC05' : '#E2E8F0'">
                    <path d="M12 2l2.9 6.26L21.5 9l-5 4.6L18 21l-6-3.2L6 21l1.5-7.4-5-4.6 6.6-.74L12 2z" />
                  </svg>
                </div>

                <!-- text -->
                <p class="text-[13.5px] md:text-[14px] text-[#334155] leading-relaxed flex-1 mb-6">
                  {{ r.text }}
                </p>

                <!-- author -->
                <div class="flex items-center gap-3 mt-auto pt-4 border-t border-slate-100">
                  <div class="w-10 h-10 rounded-full flex-shrink-0 bg-[#0B2A4A] flex items-center justify-center overflow-hidden">
                    <img
                      v-if="r.avatar && !failed.has(i)"
                      :src="r.avatar"
                      :alt="r.author"
                      class="w-full h-full object-cover"
                      loading="lazy"
                      referrerpolicy="no-referrer"
                      @error="onImgError(i)"
                    />
                    <span v-else class="text-[13px] font-heading font-bold text-white">{{ initials(r.author) }}</span>
                  </div>
                  <div class="min-w-0">
                    <a
                      :href="r.link"
                      target="_blank"
                      rel="noopener nofollow"
                      class="block text-[13.5px] font-heading font-bold text-[#0B2A4A] truncate hover:text-[#F9531E] transition-colors"
                    >
                      {{ r.author }}
                    </a>
                    <span class="text-[11.5px] text-[#94A3B8]">{{ formatDate(r.time) }}</span>
                  </div>
                  <!-- mini Google G -->
                  <svg class="ml-auto flex-shrink-0" width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1Z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.99.66-2.26 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23Z" />
                    <path fill="#FBBC05" d="M5.84 14.1a6.6 6.6 0 0 1 0-4.2V7.06H2.18a11 11 0 0 0 0 9.88l3.66-2.84Z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38Z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Arrows -->
        <template v-if="reviews.length > perView">
          <button
            type="button"
            :aria-label="$t('reviews.prev')"
            class="hidden md:flex absolute top-1/2 -translate-y-1/2 -left-3 lg:-left-5 w-10 h-10 rounded-full bg-white border border-slate-200 shadow-md items-center justify-center text-[#0B2A4A] hover:bg-[#F9531E] hover:text-white hover:border-[#F9531E] transition-colors"
            @click="prev"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6" /></svg>
          </button>
          <button
            type="button"
            :aria-label="$t('reviews.next')"
            class="hidden md:flex absolute top-1/2 -translate-y-1/2 -right-3 lg:-right-5 w-10 h-10 rounded-full bg-white border border-slate-200 shadow-md items-center justify-center text-[#0B2A4A] hover:bg-[#F9531E] hover:text-white hover:border-[#F9531E] transition-colors"
            @click="next"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6" /></svg>
          </button>
        </template>
      </div>

      <!-- Dots -->
      <div v-if="maxIndex > 0" class="flex justify-center gap-2 mt-8">
        <button
          v-for="d in maxIndex + 1"
          :key="d"
          type="button"
          :aria-label="`${d}`"
          class="h-2 rounded-full transition-all duration-300"
          :class="index === d - 1 ? 'w-6 bg-[#F9531E]' : 'w-2 bg-slate-300 hover:bg-slate-400'"
          @click="go(d - 1)"
        />
      </div>
    </div>
  </section>
</template>


// みます（見ます）: kiểm tra, khám bệnh
// さがします（探します）: tìm, tìm kiếm
// おくれます（遅れます）: chậm, muộn
// まにあいます（間に合います）: kịp giờ
// やります: làm
// ひろいます（拾います）: nhặt, lượm
// れんらくします（連絡します）: liên lạc
// きぶんが いい（気分がいい）: cảm thấy khỏe, dễ chịu
// きぶんが わるい（気分が悪い）: cảm thấy mệt, khó chịu
// うんどうかい（運動会）: hội thi thể thao
// ぼんおどり（盆踊り）: múa Bon
// フリーマーケット: chợ trời, chợ đồ cũ
// ばしょ（場所）: địa điểm, nơi
// ボランティア: tình nguyện viên
// さいふ（財布）: ví
// ごみ: rác
// こっかいぎじどう（国会議事堂）: tòa nhà quốc hội
// へいじつ（平日）: ngày thường
// ～べん（～弁）: phương ngữ, tiếng địa phương
// こんど（今度）: lần tới
// ずいぶん（随分）: khá, tương đối
// ちょくせつ（直接）: trực tiếp
// いつでも: lúc nào cũng
// どこでも: ở đâu cũng
// だれでも: ai cũng
// なんでも: cái gì cũng
// こんな: như thế này
// そんな: như thế đó
// あんな: như thế kia
// かたづきます（片付きます）: được dọn dẹp gọn gàng
// だします（出します）: đổ, để (rác)
// もえる ごみ（燃えるごみ）: rác cháy được
// おきば（置き場）: nơi để
// よこ（横）: bên cạnh
// びん（瓶）: chai
// かん（缶）: lon
// ガス: gas
// うちゅう（宇宙）: vũ trụ
// さま（様）: ông/bà/ngài
// うちゅうせん（宇宙船）: tàu vũ trụ
// こわい（怖い）: sợ
// うちゅうステーション（宇宙ステーション）: trạm vũ trụ
// ちがいます（違います）: khác
// うちゅうひこうし（宇宙飛行士）: nhà du hành vũ trụ