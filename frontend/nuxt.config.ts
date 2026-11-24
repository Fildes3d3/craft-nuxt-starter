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
      // Craft control-panel URL, used for editor-facing links.
      // Runtime override: NUXT_PUBLIC_CMS_ADMIN_URL
      cmsAdminUrl: 'http://localhost/admin',
    },
    // Craft GraphQL endpoint — server side only. Craft's GraphQL is not
    // public: the browser goes through Nuxt's /_gql allowlist, and only the
    // Nuxt server talks to Craft. "web:8080" is nginx's internal-only server
    // block on the Docker network (no hairpin NAT, no SSL, not published).
    //
    // ⚠ Naming gotcha: private runtimeConfig keys are only overridable at
    // runtime by env vars with the NUXT_ prefix → NUXT_GQL_API_HOST_SERVER.
    gqlApiHostServer: 'http://web:8080/api',
    // Bearer token for Craft's private "Nuxt (server only)" schema.
    // `make setup` creates it and writes GQL_TOKEN to the root .env.
    // Runtime override: NUXT_GQL_TOKEN
    gqlToken: '',
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
