// nuxt.config.ts
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  future: {
    compatibilityVersion: 4,
  },

  modules: [
    '@nuxt/ui',
    '@nuxt/image',
    '@nuxt/content',
    '@nuxt/eslint',
    '@nuxt/scripts',
    '@nuxt/a11y',
    '@pinia/nuxt',
    'nuxt-swiper',
    'nuxt-viewport',
    'nuxt-gtag',
    '@nuxtjs/sitemap',
  ],

  icon: {
    serverBundle: 'local',
  },

  // @ts-expect-error nuxt-gtag types not compatible with Nuxt 4 yet
  gtag: {
    id: 'GTM-TWLP3CW3',
  },

  site: {
    url: process.env.NUXT_PUBLIC_SITE_URL || 'http://localhost:3000',
    name: 'Art Tools',
  },

  sitemap: {
    sources: ['/api/sitemap/urls'],
    exclude: ['/admin/**', '/cart/**', '/search'],
  },

  css: ['~/assets/css/main.css'],

  runtimeConfig: {
    apiInternalBase: process.env.API_INTERNAL_BASE || 'http://127.0.0.1:8000/api',
    public: {
      siteUrl: process.env.NUXT_PUBLIC_SITE_URL || 'http://localhost:3000',
      apiBase: process.env.NUXT_PUBLIC_API_BASE || '/api',
      cloudinaryCloudName: process.env.NUXT_PUBLIC_CLOUDINARY_CLOUD_NAME || '',
      cloudinaryUploadPreset: process.env.NUXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || '',
      ogImage: process.env.NUXT_PUBLIC_OG_IMAGE || '',
    },
  },

  viewport: {
    breakpoints: {
      xs: 320,
      sm: 640,
      md: 768,
      lg: 1024,
      xl: 1280,
    },
  },

  app: {
    head: {
      title: 'Art Tools — Електроінструменти та обладнання',
      htmlAttrs: {
        lang: 'uk',
      },
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        {
          name: 'description',
          content:
                        'Art Tools — електроінструменти та обладнання. Продаж, каталог, актуальні ціни та наявність.',
        },

        { property: 'og:type', content: 'website' },
        { property: 'og:title', content: 'Art Tools — Електроінструменти та обладнання' },
        {
          property: 'og:description',
          content: 'Електроінструменти та обладнання. Каталог, характеристики та продаж.',
        },
        { property: 'og:image', content: process.env.NUXT_PUBLIC_OG_IMAGE || '' },
        { property: 'og:url', content: process.env.NUXT_PUBLIC_SITE_URL || 'http://localhost:3000' },
        { property: 'og:site_name', content: 'Art Tools' },
        { property: 'og:locale', content: 'uk_UA' },

        { name: 'twitter:card', content: 'summary_large_image' },
        { name: 'twitter:title', content: 'Art Tools — Електроінструменти та обладнання' },
        { name: 'twitter:description', content: 'Електроінструменти та обладнання. Каталог і продаж.' },
        { name: 'twitter:image', content: process.env.NUXT_PUBLIC_OG_IMAGE || '' },
      ],
      link: [
        { rel: 'icon', type: 'image/png', href: '/logo-art-tools.png' },
        { rel: 'apple-touch-icon', href: '/logo-art-tools.png' },
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Bebas+Neue&display=swap',
        },
      ],
    },
  },
})