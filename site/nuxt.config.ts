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
  ],


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
      link: [
        {
          rel: 'preconnect',
          href: 'https://fonts.googleapis.com',
        },
        {
          rel: 'preconnect',
          href: 'https://fonts.gstatic.com',
          crossorigin: '',
        },
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Inter:wght@300;400;500;600;700&display=swap',
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
    url: 'https://yourdomain.com',
    name: 'Electric Zen',
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

  // Sitemap
  sitemap: {
    sources: ['/api/__sitemap-urls'],
  },

  // OG Image — disabled during dev to avoid TTY prompt issues
  // Enable in production with a configured renderer
  ogImage: {
    enabled: false,
  },

  // Schema.org
  schemaOrg: {
    identity: {
      type: 'LocalBusiness',
      name: 'Electric Zen Therapy',
      url: 'https://yourdomain.com',
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
      siteUrl: process.env.NUXT_PUBLIC_SITE_URL || 'https://yourdomain.com',
      trackingApiUrl: process.env.NUXT_PUBLIC_TRACKING_API_URL || '',
    },
  },

  // Dev tools
  devtools: { enabled: true },
})
