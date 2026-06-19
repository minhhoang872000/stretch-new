<script setup lang="ts">
const { t } = useI18n();

const locations = computed(() => [
  {
    id: "home",
    title: t("where_we_work.home_title"),
    desc: t("where_we_work.home_desc"),
    icon: `<svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="m3 9 9-7 9 7v11a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1z" /><path d="M9 22V12h6v10" /></svg>`,
  },
  {
    id: "clinic",
    title: t("where_we_work.clinic_title"),
    desc: t("where_we_work.clinic_desc"),
    icon: `<svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M2 22h20" /><path d="M8 22V5a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v17" /><path d="M8 10H4a1 1 0 0 0-1 1v11" /><path d="M16 10h4a1 1 0 0 1 1 1v11" /><rect x="10" y="7" width="1.5" height="2" rx="0.3" /><rect x="12.5" y="7" width="1.5" height="2" rx="0.3" /><rect x="10" y="11" width="1.5" height="2" rx="0.3" /><rect x="12.5" y="11" width="1.5" height="2" rx="0.3" /><rect x="10" y="15" width="1.5" height="2" rx="0.3" /><rect x="12.5" y="15" width="1.5" height="2" rx="0.3" /><rect x="5" y="13" width="1.5" height="2" rx="0.3" /><rect x="5" y="17" width="1.5" height="2" rx="0.3" /><rect x="17.5" y="13" width="1.5" height="2" rx="0.3" /><rect x="17.5" y="17" width="1.5" height="2" rx="0.3" /></svg>`,
  },
  {
    id: "event",
    title: t("where_we_work.event_title"),
    desc: t("where_we_work.event_desc"),
    icon: `<svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="7" cy="10" r="3" /><path d="M2 20a4 4 0 0 1 4-4h2a4 4 0 0 1 1.7.38" /><circle cx="17" cy="10" r="3" /><path d="M14.3 16.38A4 4 0 0 1 16 16h2a4 4 0 0 1 4 4" /><path d="M6 21v-1.5A3.5 3.5 0 0 1 9.5 16h5a3.5 3.5 0 0 1 3.5 3.5V21" fill="white" /><circle cx="12" cy="7" r="4" fill="white" /></svg>`,
  },
]);
</script>

<template>
  <section class="py-16 md:py-24 bg-white relative">
    <div class="section-container relative">
      <div
        class="bg-[#FCFDFE] border border-slate-200/80 rounded-[20px] p-5 sm:p-6 md:p-8 lg:p-10 shadow-[0_8px_30px_rgb(0,0,0,0.015)] relative overflow-hidden"
      >
        <div class="relative z-10">
          <!-- Title -->
          <div class="text-center mb-8 md:mb-10 relative">
            <h2
              class="text-2xl md:text-[32px] font-heading font-extrabold text-[#0B2A4A] tracking-tight"
            >
              {{ $t("where_we_work.title") }}
            </h2>
          </div>

          <!-- Grid -->
          <div
            class="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5 md:gap-0 relative mb-2"
          >
            <div
              v-for="(loc, index) in locations"
              :key="loc.id"
              class="flex items-center text-left gap-3 sm:gap-4 px-2 sm:px-3 md:px-4 lg:px-6 py-3 sm:py-4 relative"
            >
              <!-- Icon Circle Container with Sleek Shadow and Subtle Bezel Gradient -->
              <div
                class="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 lg:w-[68px] lg:h-[68px] rounded-full bg-gradient-to-br from-white to-[#F8FAFC] flex items-center justify-center flex-shrink-0 shadow-[0_8px_25px_rgba(11,42,74,0.05)] border border-slate-200/60 relative z-10 transition-transform duration-300 hover:scale-105"
              >
                <div class="text-[#0B2A4A]" v-html="loc.icon" />
              </div>

              <!-- Content -->
              <div class="flex-1 min-w-0">
                <h3
                  class="font-heading font-extrabold text-[#0B2A4A] text-[15px] sm:text-[16px] md:text-[16px] lg:text-[17px] mb-1 leading-snug"
                >
                  {{ loc.title }}
                </h3>
                <p
                  class="text-[12.5px] md:text-[12.5px] lg:text-[13px] text-[#475569] leading-snug max-w-[200px] sm:max-w-[220px] md:max-w-[190px] lg:max-w-[210px]"
                >
                  {{ loc.desc }}
                </p>
              </div>

              <!-- Vertical Divider -->
              <div
                v-if="index < locations.length - 1"
                class="hidden md:block absolute right-0 top-1/2 -translate-y-1/2 w-[1px] h-14 lg:h-16 bg-[#E2E8F0]/80"
              />
            </div>
          </div>

          <!-- Google Maps Link (Styled to perfectly integrate into the new premium design) -->
          <div class="flex justify-center mt-12">
            <a
              href="https://maps.app.goo.gl/WwCZrHPgufY7Ehyr8"
              target="_blank"
              rel="noopener noreferrer"
              class="inline-flex items-center gap-2 text-[#0B2A4A] hover:text-[#0f3e6d] font-heading font-extrabold text-[13px] tracking-wide uppercase group transition-colors"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
              <span
                class="border-b border-[#0B2A4A]/20 group-hover:border-[#0f3e6d]/40 pb-0.5"
                >{{ $t("where_we_work.explore_location") }}</span
              >
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2.5"
                stroke-linecap="round"
                stroke-linejoin="round"
                class="translate-y-[0.5px] group-hover:translate-x-1 transition-transform"
              >
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
