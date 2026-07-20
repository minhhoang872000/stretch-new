// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-04-27',

  modules: [
    '@nuxtjs/seo',
    // '@nuxt/content' removed: it was unused (blog content comes from the
    // external lead-tracker API, not Nuxt Content) and on Cloudflare it would
    // force a D1 database binding. Run `npm uninstall @nuxt/content` to drop the dep.
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
      // `lang` is set reactively per-locale in app.vue via useI18n so Vietnamese
      // pages report lang="vi-VN" instead of a hardcoded "en".
      charset: 'utf-8',
      viewport: 'width=device-width, initial-scale=1',
      meta: [
        { name: 'geo.position', content: '10.7725;106.6784' },
        { name: 'geo.region', content: 'VN-SG' },
        { name: 'geo.placename', content: 'Ho Chi Minh City' },
        { name: 'ICBM', content: '10.7725, 106.6784' },
      ],
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
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
    // Drop the auto-discovered dynamic-route placeholder (e.g. `/sharing-hub/:slug`,
    // `/vi/sharing-hub/:slug`) — those are not real URLs. The real per-post URLs
    // are supplied explicitly by the API source above.
    exclude: [/:slug/],
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
    // NOTE: no `pages` (custom route) block here on purpose. `customRoutes`
    // defaults to 'page', so a `pages` config block would be IGNORED by the
    // router anyway — but @nuxtjs/sitemap DOES read it, which previously made
    // the sitemap advertise translated paths (`/goc-chia-se`, `/vi/kinh-doanh/*`)
    // that all 404. The site actually serves every VN page at `/vi/<en-path>`.
    // If you want pretty Vietnamese URLs, add `customRoutes: 'config'` + the
    // `pages` block AND 301-redirect the old `/vi/<en-path>` URLs.
  },

  // Nitro SSR / prerender
  nitro: {
    // Deploy target: Cloudflare Pages with SSR (edge functions). This generates
    // dist/_worker.js + dist/_routes.json so the prerendered static pages are
    // served as files while dynamic blog routes (sharing-hub/*, goc-chia-se/*)
    // are server-rendered on the edge — Googlebot gets full HTML, and the
    // `swr: 60` route rules below actually take effect. Build output dir: dist/
    preset: 'cloudflare-pages',
    prerender: {
      routes: ['/'],
      crawlLinks: true,
      // Emit `/individual.html` instead of `/individual/index.html`. On
      // Cloudflare Pages the subfolder form makes `/individual` 308-redirect
      // to `/individual/`, while canonical + sitemap + hreflang all say the
      // slash-less URL — Google then sees "page with redirect" and ignores
      // the hreflang pair (this is why /vi never got indexed). The flat
      // `.html` form serves the slash-less URL directly with 200.
      autoSubfolderIndex: false,
      // Don't bake the dynamic blog pages into static files at build time.
      ignore: ['/sharing-hub', '/vi/sharing-hub'],
    },
  },

  // Per-route rules: blog is dynamic content (edited in the CMS). Instead of
  // re-rendering + re-hitting the API on every single request (no-store), cache
  // the rendered page for 60s with stale-while-revalidate: the first visitor
  // pays the render cost, everyone in the next 60s gets an instant cached page,
  // and a CMS edit shows up within ~60s. Big latency win, tiny staleness window.
  routeRules: {
    '/sharing-hub': { prerender: false, swr: 60 },
    '/sharing-hub/**': { prerender: false, swr: 60 },
    '/vi/sharing-hub': { prerender: false, swr: 60 },
    '/vi/sharing-hub/**': { prerender: false, swr: 60 },
  },

  // Runtime config
  runtimeConfig: {
    databaseUrl: process.env.DATABASE_URL || '',
    public: {
      siteUrl: process.env.NUXT_PUBLIC_SITE_URL || 'https://stretch.vn',
      trackingApiUrl: process.env.NUXT_PUBLIC_TRACKING_API_URL || '',
      emailjsServiceId: process.env.NUXT_PUBLIC_EMAILJS_SERVICE_ID || '',
      emailjsTemplateId: process.env.NUXT_PUBLIC_EMAILJS_TEMPLATE_ID || '',
      emailjsAdminTemplateId: process.env.NUXT_PUBLIC_EMAILJS_ADMIN_TEMPLATE_ID || '',
      emailjsPublicKey: process.env.NUXT_PUBLIC_EMAILJS_PUBLIC_KEY || '',
    },
  },

  // Dev tools
  devtools: { enabled: true },
})
