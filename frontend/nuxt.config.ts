import tailwindcss from '@tailwindcss/vite'

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  modules: ['@nuxt/eslint', '@nuxt/test-utils/module'],

  // Always SSR — `nuxt build` outputs a Node server, never static.
  ssr: true,
  nitro: { preset: 'node-server' },

  // Plain literal defaults only — Nuxt applies NUXT_-prefixed env vars at
  // runtime by itself. Reading process.env here would bake build-time values
  // into the bundle and defeat runtime overriding.
  runtimeConfig: {
    public: {
      // Browser-side GraphQL endpoint.
      // Runtime override: NUXT_PUBLIC_GQL_API_HOST
      gqlApiHost: 'http://localhost/api',
      // Craft control-panel URL, used for editor-facing links.
      // Runtime override: NUXT_PUBLIC_CMS_ADMIN_URL
      cmsAdminUrl: 'http://localhost/admin',
    },
    // Server-side (SSR) GraphQL endpoint — stays on the internal Docker
    // network ("web" is the nginx service), avoiding hairpin NAT and SSL.
    //
    // ⚠ Naming gotcha: private runtimeConfig keys are only overridable at
    // runtime by env vars with the NUXT_ prefix → NUXT_GQL_API_HOST_SERVER.
    gqlApiHostServer: 'http://web/api',
  },

  css: ['~/assets/css/main.css'],

  vite: {
    plugins: [tailwindcss()],
  },

  app: {
    head: {
      htmlAttrs: { lang: 'en' },
      meta: [
        { name: 'description', content: 'Craft CMS 5 + Nuxt 4 headless starter' },
      ],
    },
  },
})
