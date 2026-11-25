import { defineNuxtPlugin } from '#app'
import PrimeVue from 'primevue/config'

/**
 * Only the PrimeVue config is global. The components (InputText, Textarea,
 * Calendar) and the theme CSS are imported by the booking flows that use them:
 * registered here, they and their stylesheet shipped in the entry bundle of
 * every page, including the many that render no PrimeVue control at all.
 */
export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.use(PrimeVue, { ripple: true })
})
