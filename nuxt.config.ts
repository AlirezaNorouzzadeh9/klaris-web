import tailwindcss from '@tailwindcss/vite'

export default defineNuxtConfig({
  // Only the finished pages are prerendered; the nav links to sections that do not exist yet.
  nitro: {
    prerender: { crawlLinks: false, routes: ['/', '/skins'], failOnError: false },
  },
  compatibilityDate: '2026-09-01',
  devtools: { enabled: false },

  modules: ['@nuxt/icon', '@nuxt/fonts', 'shadcn-nuxt', 'motion-v/nuxt'],

  css: ['~/assets/css/main.css'],

  vite: {
    plugins: [tailwindcss()],
  },

  app: {
    head: {
      htmlAttrs: { lang: 'fa', dir: 'rtl' },
      title: 'KLARIS',
      titleTemplate: '%s · KLARIS',
      meta: [
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'theme-color', content: '#07090C' },
      ],
    },
  },

  // shadcn-vue primitives live in components/ui and are restyled with Klaris
  // tokens; they are building blocks, never the visual identity.
  shadcn: {
    prefix: '',
    componentDir: './app/components/ui',
  },

  fonts: {
    families: [
      { name: 'Vazirmatn', provider: 'google', weights: [400, 500, 600, 700, 800, 900] },
      { name: 'JetBrains Mono', provider: 'google', weights: [400, 500, 700] },
    ],
  },

  icon: {
    serverBundle: { collections: ['lucide'] },
  },

  runtimeConfig: {
    public: {
      // Where catalog JSON is served from. Point this at the master server's
      // mirror for the Iran deployment (raw.githubusercontent.com is unreliable there).
      catalogBase: '/data/catalog',
    },
  },
})
