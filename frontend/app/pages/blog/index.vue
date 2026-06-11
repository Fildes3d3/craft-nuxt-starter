<script setup lang="ts">
import { blogListGql } from '~/queries/content'
import type { BlogListData } from '~/types/content'

const { query } = useCraftQuery()
const { cmsAdminUrl } = useRuntimeConfig().public

const { data, error } = await useAsyncData('blog-list', () =>
  query<BlogListData>(blogListGql),
)

if (error.value) {
  throw createError({ statusCode: 500, statusMessage: error.value.message })
}

const posts = computed(() => data.value?.entries ?? [])

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en', {
    year: 'numeric', month: 'long', day: 'numeric',
  })
}

useSeoMeta({
  title: 'Blog',
  description: 'Posts from the Blog channel — fetched from Craft over GraphQL.',
  ogTitle: 'Blog',
})
</script>

<template>
  <div class="mx-auto max-w-3xl px-6 py-16">
    <h1 class="text-4xl font-bold tracking-tight mb-12">Blog</h1>

    <div v-if="posts.length" class="space-y-10">
      <article v-for="post in posts" :key="post.slug">
        <NuxtLink :to="`/blog/${post.slug}`" class="group block">
          <h2 class="text-xl font-semibold group-hover:underline underline-offset-2">
            {{ post.title }}
          </h2>
          <time class="text-sm text-neutral-400">{{ formatDate(post.postDate) }}</time>
          <p v-if="post.excerpt" class="mt-2 text-neutral-600">{{ post.excerpt }}</p>
        </NuxtLink>
      </article>
    </div>

    <p v-else class="text-neutral-500">
      No posts yet — create one in the
      <a :href="cmsAdminUrl" class="underline">Craft control panel</a>.
    </p>
  </div>
</template>
