<script setup lang="ts">
import type { ContentBlock } from '~/types/content'

defineProps<{ blocks: ContentBlock[] }>()

// To add a block type: create the entry type in Craft, add it to the GraphQL
// fragment + ContentBlock union, then add a case below. The v-if narrows the
// union, so each child component receives an exactly-typed block — no casts.
</script>

<template>
  <div>
    <template v-for="block in blocks" :key="block.id">
      <BlocksBlockHero v-if="block.typeHandle === 'heroBlock'" :block="block" />
      <BlocksBlockText v-else-if="block.typeHandle === 'textBlock'" :block="block" />
      <BlocksBlockImage v-else-if="block.typeHandle === 'imageBlock'" :block="block" />
    </template>
  </div>
</template>
