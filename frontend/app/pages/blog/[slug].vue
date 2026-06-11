<script setup lang="ts">
import { blogPostGql } from '~/queries/content'
import type { BlogPostData } from '~/types/content'

// Remount on every path change — see app/pages/[slug].vue for why.
definePageMeta({
  key: route => route.fullPath,
})

const route = useRoute()
const slug  = String(route.params.slug)

const { query } = useCraftQuery()

const { data, error } = await useAsyncData(`blog-${slug}`, () =>
  query<BlogPostData>(blogPostGql, { slug: [slug] }),
)

if (error.value) {
  throw createError({ statusCode: 500, statusMessage: error.value.message })
}

if (!data.value?.entry) {
  throw createError({ statusCode: 404, statusMessage: 'Post not found' })
}

const post  = computed(() => data.value!.entry!)
const asset = computed(() => post.value.image[0] ?? null)

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en', {
    year: 'numeric', month: 'long', day: 'numeric',
  })
}

useSeoMeta({
  title: () => post.value.title,
  description: () => post.value.excerpt ?? undefined,
  ogTitle: () => post.value.title,
  ogDescription: () => post.value.excerpt ?? undefined,
  ogType: 'article',
  ogImage: () => asset.value?.url,
})
</script>

<template>
  <article class="mx-auto max-w-3xl px-6 py-16">
    <header class="mb-10">
      <h1 class="text-4xl font-bold tracking-tight">{{ post.title }}</h1>
      <time class="mt-2 block text-sm text-neutral-400">{{ formatDate(post.postDate) }}</time>
    </header>

    <img
      v-if="asset"
      :src="asset.url"
      :alt="asset.alt ?? ''"
      class="rounded-lg w-full mb-10"
    >

    <!-- eslint-disable-next-line vue/no-v-html -- trusted CMS content (CKEditor) -->
    <div v-if="post.body" class="prose-body" v-html="post.body" />

    <NuxtLink to="/blog" class="mt-12 inline-block text-sm text-neutral-500 hover:text-neutral-900">
      ← All posts
    </NuxtLink>
  </article>
</template>
