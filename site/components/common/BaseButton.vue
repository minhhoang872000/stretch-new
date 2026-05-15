<script setup lang="ts">
interface Props {
  variant?: 'primary' | 'outline' | 'ghost' | 'accent'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  disabled?: boolean
  href?: string
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'primary',
  size: 'md',
  loading: false,
  disabled: false,
})

const classes = computed(() => {
  const base = 'inline-flex items-center justify-center font-heading font-bold transition-all duration-300 active:scale-[0.97] rounded-full'

  const sizes: Record<string, string> = {
    sm: 'px-5 py-2 text-sm gap-2',
    md: 'px-7 py-3 text-body-md gap-2',
    lg: 'px-10 py-4 text-lg gap-3',
  }

  const variants: Record<string, string> = {
    primary: 'bg-primary-container text-white hover:bg-primary hover:shadow-glow disabled:opacity-50',
    outline: 'border-2 border-primary-container text-primary-container hover:bg-primary-container hover:text-white disabled:opacity-50',
    ghost: 'text-primary hover:bg-primary/5 disabled:opacity-50',
    accent: 'bg-accent text-primary font-bold hover:shadow-glow-accent disabled:opacity-50',
  }

  return [base, sizes[props.size], variants[props.variant]].join(' ')
})
</script>

<template>
  <NuxtLink
    v-if="href && !disabled"
    :to="href"
    :class="classes"
  >
    <slot />
  </NuxtLink>
  <button
    v-else
    :disabled="disabled || loading"
    :class="classes"
    class="disabled:cursor-not-allowed"
  >
    <span
      v-if="loading"
      class="material-symbols-outlined animate-spin text-lg"
    >progress_activity</span>
    <slot />
  </button>
</template>
