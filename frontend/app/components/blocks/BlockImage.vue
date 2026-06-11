<script setup lang="ts">
import type { ImageBlock } from '~/types/content'

const props = defineProps<{ block: ImageBlock }>()

// Assets field is configured with maxRelations: 1 — a single guard here
// keeps the template free of non-null assertions.
const asset = computed(() => props.block.image[0] ?? null)
</script>

<template>
  <figure v-if="asset" class="mx-auto max-w-3xl px-6 py-6">
    <img
      :src="asset.url"
      :alt="asset.alt ?? ''"
      :width="asset.width ?? undefined"
      :height="asset.height ?? undefined"
      class="rounded-lg w-full"
      loading="lazy"
    >
    <figcaption v-if="block.caption" class="mt-2 text-sm text-neutral-500">
      {{ block.caption }}
    </figcaption>
  </figure>
</template>
