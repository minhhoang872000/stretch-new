import type { RouterConfig } from '@nuxt/schema'

export default <RouterConfig>{
  scrollBehavior(to, from, savedPosition) {
    // If returning to a saved scroll position (e.g. back button), scroll smoothly
    if (savedPosition) {
      return {
        ...savedPosition,
        behavior: 'smooth'
      }
    }

    // Scroll to anchor smoothly if hash is present
    if (to.hash) {
      return {
        el: to.hash,
        behavior: 'smooth',
        top: 100 // offset for fixed header
      }
    }

    // Scroll to top smoothly for new page navigation
    return {
      top: 0,
      behavior: 'smooth'
    }
  }
}
