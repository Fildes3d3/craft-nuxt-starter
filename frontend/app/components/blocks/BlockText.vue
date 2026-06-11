<script setup lang="ts">
import type { TextBlock } from '~/types/content'

defineProps<{ block: TextBlock }>()
</script>

<template>
  <section class="mx-auto max-w-3xl px-6 py-6">
    <!-- eslint-disable-next-line vue/no-v-html -- trusted CMS content (CKEditor) -->
    <div class="prose-body" v-html="block.body" />
  </section>
</template>
