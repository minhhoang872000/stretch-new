<script setup lang="ts">
const { t } = useI18n()
const testimonials = computed(() => [
  {
    id: 1,
    name: 'Sarah K.',
    role: t('testimonials.t1_role'),
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face',
    rating: 5,
    text: t('testimonials.t1_text'),
  },
  {
    id: 2,
    name: 'Marcus T.',
    role: t('testimonials.t2_role'),
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
    rating: 5,
    text: t('testimonials.t2_text'),
  },
  {
    id: 3,
    name: 'Elena V.',
    role: t('testimonials.t3_role'),
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face',
    rating: 5,
    text: t('testimonials.t3_text'),
  },
])

const currentIndex = ref(0)
let interval: ReturnType<typeof setInterval>

onMounted(() => {
  interval = setInterval(() => {
    currentIndex.value = (currentIndex.value + 1) % testimonials.length
  }, 5000)
})

onUnmounted(() => {
  clearInterval(interval)
})
</script>

<template>
  <section class="py-16 md:py-24 bg-footer text-white rounded-t-[40px] relative overflow-hidden">
    <!-- Background element -->
    <div class="absolute top-0 right-0 w-[800px] h-[800px] bg-primary/20 blur-[100px] rounded-full translate-x-1/3 -translate-y-1/2 pointer-events-none" />

    <div class="section-container relative">
      <!-- Section Header -->
      <div class="text-center mb-16">
        <span class="badge-accent mb-4 inline-block !bg-accent/20 !text-accent">{{ $t('testimonials.eyebrow') }}</span>
        <h2 class="section-title text-white">{{ $t('testimonials.title') }}</h2>
        <p class="section-subtitle text-slate-300">
          {{ $t('testimonials.subtitle') }}
        </p>
      </div>

      <div class="max-w-3xl mx-auto">
        <div class="relative">
          <TransitionGroup name="testimonial">
            <div
              v-for="(t, i) in testimonials"
              v-show="currentIndex === i"
              :key="t.id"
              class="bg-white/10 backdrop-blur-lg rounded-[40px] p-10 md:p-14 border border-white/10 text-center"
            >
              <div class="w-14 h-14 rounded-2xl bg-accent/20 flex items-center justify-center mx-auto mb-8">
                <span class="material-symbols-outlined text-accent text-3xl">format_quote</span>
              </div>

              <div class="flex justify-center gap-1 mb-6">
                <span
                  v-for="s in t.rating"
                  :key="s"
                  class="material-symbols-outlined text-secondary-container text-xl"
                  style="font-variation-settings: 'FILL' 1"
                >star</span>
              </div>

              <p class="text-body-lg text-white/90 leading-relaxed mb-8 max-w-xl mx-auto italic">
                "{{ t.text }}"
              </p>

              <div class="flex items-center justify-center gap-4">
                <img
                  :src="t.avatar"
                  :alt="t.name"
                  class="w-14 h-14 rounded-full object-cover border-2 border-accent/30"
                  loading="lazy"
                />
                <div class="text-left">
                  <p class="font-heading font-bold text-white">{{ t.name }}</p>
                  <p class="text-body-sm text-white/50">{{ t.role }}</p>
                </div>
              </div>
            </div>
          </TransitionGroup>
        </div>

        <div class="flex justify-center gap-3 mt-8">
          <button
            v-for="(_, i) in testimonials"
            :key="i"
            class="w-3 h-3 rounded-full transition-all duration-300"
            :class="currentIndex === i ? 'bg-accent w-8' : 'bg-white/30 hover:bg-white/50'"
            @click="currentIndex = i"
          />
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.testimonial-enter-active { transition: all 0.5s cubic-bezier(0.16, 1, 0.3, 1); }
.testimonial-leave-active { transition: all 0.3s ease; position: absolute; width: 100%; }
.testimonial-enter-from { opacity: 0; transform: translateX(30px); }
.testimonial-leave-to { opacity: 0; transform: translateX(-30px); }
</style>
