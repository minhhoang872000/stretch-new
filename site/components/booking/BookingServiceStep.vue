<script setup lang="ts">
const emit = defineEmits<{
  (e: 'select', serviceId: string): void
}>()

const { products, pending } = useProducts()
const selectedId = ref<string | null>(null)

function choose(product: any) {
  selectedId.value = product.id
  setTimeout(() => {
    emit('select', product.id)
  }, 300)
}
</script>

<template>
  <section>
    <!-- Loading Skeletons -->
    <div v-if="pending" class="grid grid-cols-1 md:grid-cols-3 gap-8">
      <div v-for="i in 3" :key="i" class="card h-[400px] animate-pulse bg-off-white" />
    </div>

    <!-- Service Cards Grid -->
    <div v-else class="grid grid-cols-1 md:grid-cols-3 gap-8">
      <div
        v-for="product in (products as any[])"
        :key="product.id"
        class="group relative bg-white rounded-3xl border p-6 transition-all duration-300
               hover:shadow-card-hover overflow-hidden cursor-pointer"
        :class="selectedId === product.id
          ? 'border-navy ring-2 ring-navy/5'
          : 'border-border'"
        @click="choose(product)"
      >
        <!-- Popular tag -->
        <div
          v-if="product.tags?.includes('popular')"
          class="absolute top-4 right-4 z-10"
        >
          <span class="bg-accent text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
            {{ $t('products.mostPopular') }}
          </span>
        </div>

        <!-- Image -->
        <div class="mb-6 rounded-2xl overflow-hidden aspect-[4/3]">
          <img
            :src="product.coverImage"
            :alt="product.name"
            class="w-full h-full object-cover transition-all duration-700 group-hover:scale-105"
            :class="selectedId === product.id ? '' : 'grayscale group-hover:grayscale-0'"
            loading="lazy"
          />
        </div>

        <!-- Title -->
        <h3 class="font-heading font-bold text-navy text-xl mb-2">
          {{ product.name }}
        </h3>

        <!-- Description -->
        <p class="text-sm text-text-secondary mb-6 line-clamp-2">
          {{ product.shortDescription }}
        </p>

        <!-- Price + Arrow -->
        <div class="flex justify-between items-center mt-auto pt-4 border-t border-border">
          <div class="flex flex-col">
            <span class="text-[10px] text-text-secondary uppercase font-bold tracking-wider mb-1">Starting from</span>
            <span class="font-heading font-bold text-xl text-navy">
              {{ formatPrice(product.price) }}
            </span>
          </div>
          <button
            class="w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300"
            :class="selectedId === product.id
              ? 'bg-accent text-white'
              : 'bg-navy text-white group-hover:bg-accent'"
          >
            <span class="material-symbols-outlined !text-xl">
              {{ selectedId === product.id ? 'check' : 'arrow_forward' }}
            </span>
          </button>
        </div>
      </div>
    </div>
  </section>
</template>
