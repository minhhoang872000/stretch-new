<script setup lang="ts">
const { t } = useI18n()

const faqs = computed(() => [
  {
    question: t('faq.q1'),
    answer: t('faq.a1'),
  },
  {
    question: t('faq.q2'),
    answer: t('faq.a2'),
  },
  {
    question: t('faq.q3'),
    answer: t('faq.a3'),
  },
  {
    question: t('faq.q4'),
    answer: t('faq.a4'),
  },
  {
    question: t('faq.q5'),
    answer: t('faq.a5'),
  },
])

const openIndex = ref<number | null>(null)

function toggle(index: number) {
  openIndex.value = openIndex.value === index ? null : index
}

// Note: Schema.org FAQ data can be added back once nuxt-schema-org v6 API is confirmed
</script>

<template>
  <section id="faq" class="py-16 md:py-24">
    <div class="section-container">
      <!-- Section Header -->
      <div class="text-center mb-16">
        <span class="badge-primary mb-4 inline-block">{{ $t('faq.eyebrow') }}</span>
        <h2 class="section-title">{{ $t('faq.title') }}</h2>
        <p class="section-subtitle">
          {{ $t('faq.subtitle') }}
        </p>
      </div>

      <!-- FAQ Accordion -->
      <div class="max-w-3xl mx-auto space-y-4">
        <div
          v-for="(faq, index) in faqs"
          :key="index"
          class="bg-white rounded-[24px] border border-outline-variant/20 overflow-hidden transition-shadow duration-300"
          :class="openIndex === index ? 'shadow-card-hover' : 'hover:shadow-sm'"
        >
          <!-- Question -->
          <button
            class="w-full flex items-center justify-between p-6 text-left group"
            @click="toggle(index)"
          >
            <span class="font-heading font-semibold text-body-lg pr-4 group-hover:text-primary transition-colors">
              {{ faq.question }}
            </span>
            <span
              class="material-symbols-outlined text-on-surface-variant transition-transform duration-300 flex-shrink-0"
              :class="openIndex === index ? 'rotate-180 text-primary' : ''"
            >
              expand_more
            </span>
          </button>

          <!-- Answer -->
          <Transition name="accordion">
            <div v-show="openIndex === index" class="overflow-hidden">
              <div class="px-6 pb-6 text-body-md text-on-surface-variant leading-relaxed border-t border-outline-variant/20 pt-4">
                {{ faq.answer }}
              </div>
            </div>
          </Transition>
        </div>
      </div>

      <!-- Contact CTA -->
      <div class="text-center mt-12">
        <p class="text-body-md text-on-surface-variant mb-4">
          {{ $t('faq.cantFind') }}
        </p>
        <BaseButton variant="outline" size="md" href="mailto:hello@electriczen.com">
          <span class="material-symbols-outlined text-lg">mail</span>
          {{ $t('faq.sendQuestion') }}
        </BaseButton>
      </div>
    </div>
  </section>
</template>

<style scoped>
.accordion-enter-active {
  transition: all 0.3s ease;
  max-height: 200px;
}
.accordion-leave-active {
  transition: all 0.25s ease;
  max-height: 200px;
}
.accordion-enter-from,
.accordion-leave-to {
  max-height: 0;
  opacity: 0;
}
</style>
