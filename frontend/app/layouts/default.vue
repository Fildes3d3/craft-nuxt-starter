<script setup lang="ts">
const { cmsAdminUrl } = useRuntimeConfig().public
</script>

<template>
  <div class="min-h-dvh flex flex-col">
    <header class="border-b border-neutral-200">
      <nav class="mx-auto max-w-3xl px-6 h-14 flex items-center gap-6 text-sm">
        <NuxtLink to="/" class="font-semibold">craft-nuxt-starter</NuxtLink>
        <NuxtLink to="/blog" class="text-neutral-600 hover:text-neutral-900">Blog</NuxtLink>
        <a
          :href="cmsAdminUrl"
          target="_blank"
          rel="noopener"
          class="ml-auto text-neutral-400 hover:text-neutral-600"
        >Craft admin ↗</a>
      </nav>
    </header>

    <main class="flex-1">
      <slot />
    </main>

    <footer class="border-t border-neutral-200">
      <div class="mx-auto max-w-3xl px-6 h-14 flex items-center text-xs text-neutral-400">
        Craft CMS 5 + Nuxt 4 — headless starter
      </div>
    </footer>
  </div>
</template>
