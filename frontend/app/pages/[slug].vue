<script setup lang="ts">
import { pageGql } from '~/queries/content'
import type { PageData } from '~/types/content'

// Remount this component whenever the path changes. Without this, navigating
// /about → /another-page reuses the component instance and none of the setup
// code below re-runs — a classic stale-content trap with dynamic routes.
definePageMeta({
  key: route => route.fullPath,
})

const route = useRoute()
const slug  = String(route.params.slug)

const { query } = useCraftQuery()

const { data, error } = await useAsyncData(`page-${slug}`, () =>
  query<PageData>(pageGql, { slug: [slug] }),
)

if (error.value) {
  throw createError({ statusCode: 500, statusMessage: error.value.message })
}

if (!data.value?.entry) {
  throw createError({ statusCode: 404, statusMessage: 'Page not found' })
}

const entry  = computed(() => data.value!.entry!)
const blocks = computed(() => entry.value.contentBlocks ?? [])

useSeoMeta({
  title: () => entry.value.title,
  ogTitle: () => entry.value.title,
})
</script>

<template>
  <ContentBlocks :blocks="blocks" />
</template>
