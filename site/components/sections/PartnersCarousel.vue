<script setup lang="ts">
const { t } = useI18n();

interface Partner {
  name: string;
  logo: string;
}

const partners: Partner[] = [
  { name: "Decathlon", logo: "/logos/decathlon.png" },
  { name: "Garmin", logo: "/logos/garmin.png" },
  { name: "Hyrox", logo: "/logos/hyrox.webp" },
  { name: "Ironman", logo: "/logos/ironman.png" },
  { name: "Lululemon", logo: "/logos/lululemon.webp" },
  { name: "Partner 1", logo: "/logos/partner-1.png" },
  { name: "Partner 10", logo: "/logos/partner-10.png" },
  { name: "Partner 11", logo: "/logos/partner-11.png" },
  { name: "Partner 12", logo: "/logos/partner-12.png" },
  { name: "Partner 13", logo: "/logos/partner-13.png" },
];

const allPartners = [...partners, ...partners];

const trackRef = ref<HTMLElement | null>(null);
const currentIndex = ref(0);
const isHovered = ref(false);
let scrollInterval: ReturnType<typeof setInterval> | null = null;

// Responsive visible count
const visibleCount = ref(5);

function updateVisibleCount() {
  if (typeof window === "undefined") return;
  const w = window.innerWidth;
  if (w < 480) visibleCount.value = 2;
  else if (w < 768) visibleCount.value = 3;
  else if (w < 1024) visibleCount.value = 4;
  else visibleCount.value = 6;
}

const totalSlides = computed(() => partners.length);
const dotCount = computed(() =>
  Math.ceil(totalSlides.value / visibleCount.value),
);
const activeDot = computed(
  () => Math.floor(currentIndex.value / visibleCount.value) % dotCount.value,
);

function scrollTo(index: number) {
  currentIndex.value = index % totalSlides.value;
  if (trackRef.value) {
    const itemWidth = trackRef.value.scrollWidth / allPartners.length;
    trackRef.value.style.transition =
      "transform 0.8s cubic-bezier(0.16, 1, 0.3, 1)";
    trackRef.value.style.transform = `translateX(-${currentIndex.value * itemWidth}px)`;
  }
}

function next() {
  scrollTo(currentIndex.value + 1);
}

function prev() {
  scrollTo(
    currentIndex.value <= 0 ? totalSlides.value - 1 : currentIndex.value - 1,
  );
}

function goToDot(dotIndex: number) {
  scrollTo(dotIndex * visibleCount.value);
}

function startAutoScroll() {
  stopAutoScroll();
  scrollInterval = setInterval(() => {
    if (!isHovered.value) {
      next();
    }
  }, 3500);
}

function stopAutoScroll() {
  if (scrollInterval) {
    clearInterval(scrollInterval);
    scrollInterval = null;
  }
}

function handleTransitionEnd() {
  if (currentIndex.value >= totalSlides.value && trackRef.value) {
    currentIndex.value = currentIndex.value % totalSlides.value;
    trackRef.value.style.transition = "none";
    const itemWidth = trackRef.value.scrollWidth / allPartners.length;
    trackRef.value.style.transform = `translateX(-${currentIndex.value * itemWidth}px)`;
  }
}

onMounted(() => {
  updateVisibleCount();
  window.addEventListener("resize", updateVisibleCount);
  startAutoScroll();
});

onUnmounted(() => {
  stopAutoScroll();
  if (typeof window !== "undefined") {
    window.removeEventListener("resize", updateVisibleCount);
  }
});
</script>

<template>
  <section class="py-14 lg:py-20 bg-off-white">
    <div class="section-container">
      <!-- Header -->
      <div class="text-center mb-10 lg:mb-14">
        <span
          class="text-[11px] font-heading font-bold text-text-secondary uppercase tracking-[0.2em] block mb-3"
        >
          {{ $t("partners.eyebrow") }}
        </span>
        <h2
          class="text-2xl md:text-3xl lg:text-[34px] font-heading font-bold text-navy leading-tight mb-4"
        >
          {{ $t("partners.title") }}
        </h2>
        <p
          class="text-sm md:text-base text-text-secondary max-w-xl mx-auto leading-relaxed"
        >
          {{ $t("partners.subtitle") }}
        </p>
      </div>

      <!-- Carousel Container -->
      <div
        class="relative group"
        @mouseenter="isHovered = true"
        @mouseleave="isHovered = false"
      >
        <!-- Left Arrow -->
        <button
          @click="prev"
          class="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white border border-border-default shadow-card flex items-center justify-center text-text-secondary hover:text-navy hover:shadow-card-hover transition-all"
          aria-label="Previous partners"
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 18 18"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M11 14l-5-5 5-5" />
          </svg>
        </button>

        <!-- Track -->
        <div class="overflow-hidden mx-9 md:mx-14">
          <div
            ref="trackRef"
            class="flex items-center"
            @transitionend="handleTransitionEnd"
          >
            <div
              v-for="(partner, index) in allPartners"
              :key="`${partner.name}-${index}`"
              class="flex-shrink-0 flex items-center justify-center py-6"
              :style="{ width: `${100 / visibleCount}%` }"
            >
              <div
                class="flex items-center justify-center px-2 md:px-6 select-none cursor-default group/logo"
              >
                <NuxtImg
                  :src="partner.logo"
                  :alt="partner.name"
                  class="h-14 md:h-16 lg:h-20 w-auto object-contain grayscale opacity-60 group-hover/logo:grayscale-0 group-hover/logo:opacity-100 transition-all duration-300"
                  format="webp"
                  :style="
                    partner.name === 'Lululemon'
                      ? 'mix-blend-mode: multiply;'
                      : ''
                  "
                />
              </div>
            </div>
          </div>
        </div>

        <!-- Right Arrow -->
        <button
          @click="next"
          class="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white border border-border-default shadow-card flex items-center justify-center text-text-secondary hover:text-navy hover:shadow-card-hover transition-all"
          aria-label="Next partners"
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 18 18"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M7 14l5-5-5-5" />
          </svg>
        </button>
      </div>

      <!-- Dots -->
      <div class="flex items-center justify-center gap-2 mt-6">
        <button
          v-for="(_, dotIndex) in dotCount"
          :key="dotIndex"
          @click="goToDot(dotIndex)"
          class="w-2 h-2 rounded-full transition-all duration-300"
          :class="
            activeDot === dotIndex
              ? 'bg-navy w-6'
              : 'bg-navy/15 hover:bg-navy/30'
          "
          :aria-label="`Go to partner group ${dotIndex + 1}`"
        />
      </div>
    </div>
  </section>
</template>
