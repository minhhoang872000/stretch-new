<script setup lang="ts">
// Global Schema.org for the entire site
useSchemaOrg([
  defineLocalBusiness({
    name: 'Stretch.vn',
    image: '/og-default.jpg',
    address: {
      streetAddress: '493 Điện Biên Phủ',
      addressLocality: 'Phường Bàn Cờ, Quận 3',
      addressRegion: 'TP. Hồ Chí Minh',
      postalCode: '700000',
      addressCountry: 'VN',
    },
    geo: {
      latitude: '10.7725',
      longitude: '106.6784',
    },
    telephone: '+84-938-713-498',
    openingHoursSpecification: [
      {
        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
        opens: '08:00',
        closes: '18:00',
      },
    ],
  }),
])
</script>

<template>
  <div class="min-h-screen gradient-bg">
    <NuxtPage />
    <ContactWidget />
  </div>
</template>
