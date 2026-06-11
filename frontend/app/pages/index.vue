<script setup lang="ts">
import { homeGql } from '~/queries/content'
import type { PageData } from '~/types/content'

const { query } = useCraftQuery()
const { cmsAdminUrl } = useRuntimeConfig().public

// useAsyncData (not a raw await) so GraphQL errors surface as a Nuxt error
// page instead of being silently swallowed by <Suspense>.
const { data, error } = await useAsyncData('home', () => query<PageData>(homeGql))

if (error.value) {
  throw createError({ statusCode: 500, statusMessage: error.value.message })
}

const blocks = computed(() => data.value?.entry?.contentBlocks ?? [])

// Getters keep the meta reactive if the data ever refreshes.
useSeoMeta({
  title: () => data.value?.entry?.title ?? 'Home',
  description: 'Craft CMS 5 + Nuxt 4 headless starter — GraphQL, live preview, and Docker, wired together.',
  ogTitle: () => data.value?.entry?.title ?? 'Home',
})
</script>

<template>
  <div>
    <ContentBlocks v-if="blocks.length" :blocks="blocks" />
    <div v-else class="mx-auto max-w-3xl px-6 py-24 text-center text-neutral-500">
      <p class="text-lg">No content yet.</p>
      <p class="mt-2 text-sm">
        Add blocks to the Home entry in the
        <a :href="cmsAdminUrl" class="underline">Craft control panel</a>.
      </p>
    </div>
  </div>
</template>
