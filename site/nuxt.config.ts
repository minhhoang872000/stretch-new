// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-04-27',

  modules: [
    '@nuxtjs/seo',
    '@nuxt/content',
    '@pinia/nuxt',
    '@vueuse/nuxt',
    '@nuxt/image',
    '@nuxtjs/i18n',
    '@nuxtjs/google-fonts',
  ],

  googleFonts: {
    families: {
      'Plus Jakarta Sans': [400, 500, 600, 700, 800],
      'Inter': [300, 400, 500, 600, 700],
    },
    display: 'swap',
    download: true,
    prefetch: true,
    preconnect: true,
  },

  experimental: {
    inlineSSRStyles: true,
  },

  build: {
    transpile: ['primevue']
  },
  postcss: {
    plugins: {
      '@tailwindcss/postcss': {},
    },
  },

  // Components auto-import without directory prefix
  components: [
    {
      path: '~/components',
      pathPrefix: false,
    },
  ],

  app: {
    head: {
      htmlAttrs: { lang: 'en' },
      charset: 'utf-8',
      viewport: 'width=device-width, initial-scale=1',
      meta: [
        { name: 'geo.position', content: '10.7725;106.6784' },
        { name: 'geo.region', content: 'VN-SG' },
        { name: 'geo.placename', content: 'Ho Chi Minh City' },
        { name: 'ICBM', content: '10.7725, 106.6784' },
      ],
      link: [
        {
          rel: 'preconnect',
          href: 'https://fonts.gstatic.com',
          crossorigin: '',
        },
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200',
        },
      ],
    },
    pageTransition: { name: 'page', mode: 'out-in' },
  },

  css: ['~/assets/css/main.css'],

  // SEO Configuration
  site: {
    url: 'https://stretch.vn',
    name: 'Stretch',
    description: 'Redefining physical recovery through high-intensity science and modern spiritual clarity. Book your session online.',
    defaultLocale: 'en',
  },

  // Robots.txt
  robots: {
    groups: [
      {
        userAgent: '*',
        allow: '/',
        disallow: '/api/',
      },
    ],
  },

  sitemap: {
    sources: ['/api/__sitemap-urls'],
  },

  ogImage: {
    enabled: false,
  },

  // Schema.org
  schemaOrg: {
    identity: {
      type: 'HealthClub',
      name: 'Stretch',
      url: 'https://stretch.vn',
      logo: '/og-default.jpg',
    },
  },

   // i18n
  i18n: {
    locales: [
      { code: 'en', language: 'en-US', file: 'en.json', name: 'English' },
      { code: 'vi', language: 'vi-VN', file: 'vi.json', name: 'Tiếng Việt' },
    ],
    defaultLocale: 'en',
    strategy: 'prefix_except_default',
    lazy: true,
    langDir: 'locales/',
    vueI18n: '~/i18n/i18n.config.ts',
    pages: {
      'business/recovery-event': {
        en: '/business/recovery-event',
        vi: '/kinh-doanh/phuc-hoi-su-kien',
      },
      'business/corporate-wellness': {
        en: '/business/corporate-wellness',
        vi: '/kinh-doanh/cham-soc-doanh-nghiep',
      },
      'business/education-training': {
        en: '/business/education-training',
        vi: '/kinh-doanh/dao-tao-huan-luyen',
      },
      'sharing-hub/index': {
        en: '/sharing-hub',
        vi: '/goc-chia-se',
      },
      'sharing-hub/[slug]': {
        en: '/sharing-hub/:slug',
        vi: '/goc-chia-se/:slug',
      },
    },
  },

  // Nitro SSR / prerender
  nitro: {
    prerender: {
      routes: ['/'],
      crawlLinks: true,
    },
  },

  // Runtime config
  runtimeConfig: {
    databaseUrl: process.env.DATABASE_URL || '',
    public: {
      siteUrl: process.env.NUXT_PUBLIC_SITE_URL || 'https://stretch.vn',
      trackingApiUrl: process.env.NUXT_PUBLIC_TRACKING_API_URL || '',
      emailjsServiceId: process.env.NUXT_PUBLIC_EMAILJS_SERVICE_ID || '',
      emailjsTemplateId: process.env.NUXT_PUBLIC_EMAILJS_TEMPLATE_ID || '',
      emailjsPublicKey: process.env.NUXT_PUBLIC_EMAILJS_PUBLIC_KEY || '',
    },
  },

  // Dev tools
  devtools: { enabled: true },
})
