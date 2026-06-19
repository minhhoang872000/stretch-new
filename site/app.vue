<script setup lang="ts">
// Keep <html lang> in sync with the active locale (en-US / vi-VN) for correct
// multilingual SEO. The hardcoded lang in nuxt.config was removed in favour of this.
const { locale, locales } = useI18n()
const htmlLang = computed(() => {
  const current = (locales.value as any[]).find((l) => l.code === locale.value)
  return current?.language || locale.value
})
useHead({ htmlAttrs: { lang: htmlLang } })

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
    <NuxtPage />
    <ContactWidget />
  </div>
</template>



