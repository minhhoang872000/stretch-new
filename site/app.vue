<script setup lang="ts">
// Keep <html lang> in sync with the active locale (en-US / vi-VN) for correct
// multilingual SEO. The hardcoded lang in nuxt.config was removed in favour of this.
const { locale, locales } = useI18n()
const htmlLang = computed(() => {
  const current = (locales.value as any[]).find((l) => l.code === locale.value)
  return current?.language || locale.value
})
useHead({ htmlAttrs: { lang: htmlLang } })

/**
 * Google OAuth is a full-page redirect, so the sign-in outcome arrives as a
 * query flag (`?auth=ok|failed`, set by /api/auth/google) rather than a promise
 * anyone can await. Read it once on mount, toast it, and strip it from the URL
 * so a bookmark or reload does not repeat the announcement.
 */
const { notify } = useNotification()
const { t } = useI18n()

// Captured by plugins/00.auth-flag.client.ts before the router runs: on a
// prerendered page the router has already rewritten the URL (dropping the
// query) by the time anything mounts, so reading it here found nothing.
onMounted(async () => {
  const flag = takeAuthFlag()
  if (!flag) return

  const stripFlag = () => {
    const now = new URLSearchParams(window.location.search)
    if (!now.has('auth')) return
    now.delete('auth')
    const qs = now.toString()
    window.history.replaceState(window.history.state, '', `${window.location.pathname}${qs ? `?${qs}` : ''}${window.location.hash}`)
  }
  // The SmaxAI chat plugin briefly rewrites the URL on load and then restores
  // the one it saw first — with ?auth= still on it. Strip again once it is done.
  setTimeout(stripFlag, 3000)

  // Announce once: if that restored flag survives into a reload, stay quiet.
  const KEY = 'stretch-auth-toast'
  try {
    const last = Number(sessionStorage.getItem(KEY) || 0)
    if (Date.now() - last < 30 * 1000) { stripFlag(); return }
    sessionStorage.setItem(KEY, String(Date.now()))
  } catch {
    // Blocked storage: announce anyway.
  }

  // No `await router.isReady()` here: on a prerendered page that promise never
  // settled, so nothing after it ran. The toast and the URL clean-up need
  // neither the router nor the route.
  await nextTick()
  if (flag === 'registered') notify(t('learning.auth.register_success'), 'success', 5000)
  else if (flag === 'ok') notify(t('learning.auth.login_success'), 'success')
  else notify(t('learning.auth.login_failed'), 'error', 6000)

  // Strip the flag so a reload or a bookmark does not announce it again. The
  // history state is kept as-is so Vue Router still recognises the entry.
  stripFlag()
})

// Global Schema.org for the entire site — HealthClub type
useSchemaOrg([
  defineLocalBusiness({
    '@type': 'HealthClub',
    'name': 'Stretch.vn',
    'description': 'Professional sports recovery, physiotherapy, and corporate wellness services in Ho Chi Minh City. Stretch.vn combines science-backed techniques with modern recovery technology.',
    'image': '/og-default.jpg',
    'url': 'https://stretch.vn',
    'logo': 'https://stretch.vn/stretch.jpg',
    'address': {
      '@type': 'PostalAddress',
      'streetAddress': '493 Điện Biên Phủ',
      'addressLocality': 'Phường Bàn Cờ, Quận 3',
      'addressRegion': 'TP. Hồ Chí Minh',
      'postalCode': '700000',
      'addressCountry': 'VN',
    },
    'geo': {
      '@type': 'GeoCoordinates',
      'latitude': '10.7725',
      'longitude': '106.6784',
    },
    'telephone': '+84-938-713-498',
    'priceRange': '$$',
    'currenciesAccepted': 'VND',
    'paymentAccepted': 'Cash, Credit Card, Bank Transfer',
    'openingHoursSpecification': [
      {
        '@type': 'OpeningHoursSpecification',
        'dayOfWeek': ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
        'opens': '08:00',
        'closes': '18:00',
      },
    ],
    'sameAs': [
      'https://www.facebook.com/stretch.vn',
      'https://www.instagram.com/stretch.vn',
    ],
    'hasOfferCatalog': {
      '@type': 'OfferCatalog',
      'name': 'Stretch Services',
      'itemListElement': [
        {
          '@type': 'OfferCatalog',
          'name': 'Individual Recovery',
          'itemListElement': [
            {
              '@type': 'Offer',
              'itemOffered': {
                '@type': 'Service',
                'name': 'Sports Recovery & Physiotherapy',
                'description': 'Professional recovery sessions for athletes and active individuals.',
              },
            },
          ],
        },
        {
          '@type': 'OfferCatalog',
          'name': 'Business Solutions',
          'itemListElement': [
            {
              '@type': 'Offer',
              'itemOffered': {
                '@type': 'Service',
                'name': 'Corporate Wellness Programs',
                'description': 'On-site wellness and recovery programs for businesses and offices.',
              },
            },
            {
              '@type': 'Offer',
              'itemOffered': {
                '@type': 'Service',
                'name': 'Event Recovery Services',
                'description': 'Professional recovery stations for sporting events and marathons.',
              },
            },
            {
              '@type': 'Offer',
              'itemOffered': {
                '@type': 'Service',
                'name': 'Education & Training',
                'description': 'Recovery and wellness workshops for schools and sports academies.',
              },
            },
          ],
        },
      ],
    },
  }),
])
</script>

<template>
  <div class="min-h-screen gradient-bg">
    <!-- Instant top progress bar the moment a navigation starts — visible
         feedback even before the destination page mounts. -->
    <NuxtLoadingIndicator color="#F47A1F" :height="3" />
    <NuxtPage />
    <!--
      The wrapper is load-bearing. `<NuxtPage>` runs inside Suspense with an
      out-in page transition: when the outgoing page finishes leaving, Suspense
      inserts the incoming one BEFORE whatever node followed it — this widget.
      But the widget shows and hides on scroll behind its own <Transition>, so a
      navigation that also changes the scroll position can delete that node
      mid-flight. Suspense then inserts before a node that is no longer a child
      of this div and throws NotFoundError, which rolls the navigation back
      (course page → player was the reliable way to hit it).

      A wrapper that is always present keeps this element list stable, so the
      anchor stays valid no matter what the widget does inside it. It is
      position:fixed, so an extra div costs no layout.
    -->
    <div class="contact-widget-host">
      <ContactWidget />
    </div>
    <!-- Global toast host — without it every notify() is silent. -->
    <AppToasts />
  </div>
</template>



