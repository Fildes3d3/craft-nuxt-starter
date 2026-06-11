<script setup lang="ts">
import type { HeroBlock } from '~/types/content'

defineProps<{ block: HeroBlock }>()
</script>

<template>
  <section class="mx-auto max-w-3xl px-6 py-16">
    <h1 class="text-4xl sm:text-5xl font-bold tracking-tight">
      {{ block.heading }}
    </h1>
    <p v-if="block.text" class="mt-4 text-lg text-neutral-600 max-w-xl">
      {{ block.text }}
    </p>
  </section>
</template>
