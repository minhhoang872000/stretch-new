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
    'nuxt-auth-utils',
  ],

  /**
   * NuxtImg refuses external URLs whose host is not whitelisted (the ipx
   * provider proxies them server-side). Programme covers come from the API's
   * `image` field, so every host that field may point at must be listed here —
   * a missing host renders as a silently broken image, not an error.
   * picsum.photos is the seed placeholder; it 302s to fastly.picsum.photos.
   */
  image: {
    domains: ['picsum.photos', 'fastly.picsum.photos'],
  },

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
      script: [
        // SMAX chat plugin. `smAsyncInit` must be defined BEFORE sdk.min.js
        // evaluates, so both tags are injected at bodyClose in this order.
        {
          tagPosition: 'bodyClose',
          innerHTML: `window.smAsyncInit = function () {
  SM.init({
    page_pid: 'ctm6a827fa7f4ed6d532ceeb454',
    trigger_id: '6a82806628e2f4ae79767757',
    chat_type: 'PLUGIN',
    env: 'prod'
  })
}`,
        },
        {
          tagPosition: 'bodyClose',
          src: 'https://chatbox.smax.ai/sdk.min.js',
          async: true,
          defer: true,
        },
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
    cloudflare: {
      pages: {
        // Nitro's AUTO-generated `_routes.json` lists every prerendered static
        // path individually in `exclude` (one entry per HTML page + every
        // image/font in public/) and Cloudflare hard-caps `_routes.json` at
        // 100 total include+exclude rules — Nitro silently `.splice()`s
        // whatever doesn't fit (sorted shortest-path-first), so once the site
        // has enough pages/assets, some LATER (usually `/vi/...`, deeper-path)
        // static routes get dropped from the exclude list without warning.
        // Anything dropped then falls through to the SSR Worker on every
        // request instead of being served as a static file — which is exactly
        // what caused `/vi/individual` to intermittently 500/503 in
        // production despite `dist/vi/individual.html` existing on disk.
        //
        // Fix: invert the model. Only 5 route patterns actually need the
        // Worker (the dynamic blog + API); everything else prerenders to a
        // static file. Listing those few as `include` instead of listing every
        // static file as `exclude` can never hit the 100-rule cap, no matter
        // how many pages/images the site grows to.
        defaultRoutes: false,
        routes: {
          version: 1,
          include: [
            '/sharing-hub', '/sharing-hub/*',
            '/vi/sharing-hub', '/vi/sharing-hub/*',
            // The course catalogue and its detail pages are rendered on demand
            // (see the route rules below), so the Worker has to be reachable for
            // them — anything not matched here is only ever served as a static
            // file, and a missing file is a 404 rather than a render.
            //
            // Prerendering the detail pages instead would depend on crawlLinks
            // finding every slug: the catalogue paginates at 8 and the "related"
            // strip links only 4, so the last programme in a topic gets no
            // inbound link and its URL would silently 404.
            '/learning-hub/programs', '/learning-hub/programs/*',
            '/vi/learning-hub/programs', '/vi/learning-hub/programs/*',
            // The training calendar splits sessions into upcoming vs. past
            // against "today", so it must not be frozen into a file at build
            // time — it is rendered per request and cached for 5 minutes.
            '/learning-hub/schedule', '/vi/learning-hub/schedule',
            // The course player: one route, a page per slug, and noindex — there
            // is nothing to prerender and nothing search should hold.
            '/learning-hub/learn/*', '/vi/learning-hub/learn/*',
            '/api/*',
          ],
          exclude: [],
        },
      },
    },
    prerender: {
      // List every static route explicitly (both locales) instead of relying
      // solely on crawlLinks to discover them. crawlLinks is non-deterministic
      // build-to-build — it depends on successfully parsing links out of
      // already-rendered HTML during the build, and a miss silently drops that
      // route from `dist/_routes.json`'s exclude list. That's what happened to
      // `/vi/individual`: the static file WAS emitted, but a previous deploy's
      // `_routes.json` didn't list it as prerendered, so every request fell
      // through to the SSR Worker instead of the static file — intermittent
      // 500/503/1102 depending on Worker load. Explicit routes make this
      // deterministic regardless of crawl order/timing.
      routes: [
        '/', '/vi',
        '/individual', '/vi/individual',
        '/business', '/vi/business',
        '/business/corporate-wellness', '/vi/business/corporate-wellness',
        '/business/education-training', '/vi/business/education-training',
        '/business/recovery-event', '/vi/business/recovery-event',
        '/booking', '/vi/booking',
        '/learning-hub', '/vi/learning-hub',
      ],
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
  // the rendered page with stale-while-revalidate: the first visitor pays the
  // render cost, everyone after gets an instant cached page, and a CMS edit
  // shows up within the window below.
  //
  // Widened from 60s to 300s (2026-07-28): the external lead-tracker API
  // occasionally responds slowly on a cold start, and at swr:60 that meant
  // Googlebot had a real chance of re-hitting the origin (instead of the SWR
  // cache) during a slow window and getting a 503/524 — repeated 5xx on
  // recrawl is one of the ways Google silently drops an already-indexed page.
  // 5 minutes cuts how often the origin is hit ~5x while still picking up CMS
  // edits well within a business day.
  routeRules: {
    // The /products listing + detail pages were removed (2026-07-31). They were
    // in the sitemap, so old URLs may still be indexed / linked — 301 them to the
    // closest topical page instead of serving a 404.
    '/products': { redirect: { to: '/individual', statusCode: 301 } },
    '/products/**': { redirect: { to: '/individual', statusCode: 301 } },
    '/vi/products': { redirect: { to: '/vi/individual', statusCode: 301 } },
    '/vi/products/**': { redirect: { to: '/vi/individual', statusCode: 301 } },
    // The course catalogue, its ~18 detail pages, the calendar and the player:
    // rendered per request, NOT prerendered (the crawler cannot find every slug)
    // and NOT swr-cached.
    //
    // No `swr` here on purpose: every Learning Hub page renders `LearningHeader`,
    // which puts the signed-in learner's name and initials into the HTML. A
    // shared response cache would hand one visitor's header to the next. If
    // these ever need caching, the session has to come out of the server render
    // first. `/**` also covers the bare `/programs` index, which is why that
    // path is in the `_routes.json` include list above.
    '/learning-hub/programs/**': { prerender: false },
    '/vi/learning-hub/programs/**': { prerender: false },
    '/learning-hub/schedule': { prerender: false },
    '/vi/learning-hub/schedule': { prerender: false },
    '/learning-hub/learn/**': { prerender: false },
    '/vi/learning-hub/learn/**': { prerender: false },
    '/sharing-hub': { prerender: false, swr: 300 },
    '/sharing-hub/**': { prerender: false, swr: 300 },
    '/vi/sharing-hub': { prerender: false, swr: 300 },
    '/vi/sharing-hub/**': { prerender: false, swr: 300 },
  },

  // Runtime config
  runtimeConfig: {
    databaseUrl: process.env.DATABASE_URL || '',
    /**
     * Lesson video lookup. Server-only on purpose: the service token lets this
     * site ask the API for a signed R2 playback URL on a learner's behalf, so it
     * must never reach the browser.
     */
    // NUXT_PUBLIC_TRACKING_API_URL is the host only (callers add `/api/v1`
    // themselves — see useBlog), so the fallback has to append it or every
    // lookup 404s.
    lessonApiBase:
      process.env.NUXT_LESSON_API_BASE
      || (process.env.NUXT_PUBLIC_TRACKING_API_URL
        ? `${process.env.NUXT_PUBLIC_TRACKING_API_URL.replace(/\/$/, '')}/api/v1`
        : ''),
    siteServiceToken: process.env.NUXT_SITE_SERVICE_TOKEN || '',
    public: {
      siteUrl: process.env.NUXT_PUBLIC_SITE_URL || 'https://stretch.vn',
      trackingApiUrl: process.env.NUXT_PUBLIC_TRACKING_API_URL || '',
      // Bank-transfer checkout — rendered into the VietQR code on /learning-hub/checkout.
      // Public by nature: this is the account customers are asked to pay into.
      bankCode: process.env.NUXT_PUBLIC_BANK_CODE || '',
      bankAccount: process.env.NUXT_PUBLIC_BANK_ACCOUNT || '',
      bankAccountName: process.env.NUXT_PUBLIC_BANK_ACCOUNT_NAME || '',
      emailjsServiceId: process.env.NUXT_PUBLIC_EMAILJS_SERVICE_ID || '',
      emailjsTemplateId: process.env.NUXT_PUBLIC_EMAILJS_TEMPLATE_ID || '',
      emailjsAdminTemplateId: process.env.NUXT_PUBLIC_EMAILJS_ADMIN_TEMPLATE_ID || '',
      emailjsPublicKey: process.env.NUXT_PUBLIC_EMAILJS_PUBLIC_KEY || '',
    },
  },

  // Dev tools
  devtools: { enabled: true },
})
