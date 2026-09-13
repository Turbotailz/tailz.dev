<script setup lang="ts">
import type { Block } from '~/utils/shell/types'

defineProps<{ block: Block }>()

function internal(href?: string) {
  return !!href && href.startsWith('/')
}
</script>

<template>
  <p v-if="block.kind === 'text'" class="blk-text" :class="block.tone" style="margin: 0">{{ block.text }}</p>

  <p v-else-if="block.kind === 'error'" class="blk-error" style="margin: 0">{{ block.text }}</p>

  <pre v-else-if="block.kind === 'ascii'" class="blk-ascii ascii" aria-hidden="true">{{ block.text }}</pre>

  <p v-else-if="block.kind === 'link'" style="margin: 0">
    <span class="cyan">{{ block.label }}</span>
    <span class="muted"> → </span>
    <a v-if="block.href.startsWith('mailto:')" :href="block.href">{{ block.note || block.href }}</a>
    <NuxtLink v-else-if="internal(block.href)" :to="block.href">{{ block.note || block.href }}</NuxtLink>
    <a v-else :href="block.href" target="_blank" rel="noopener noreferrer">{{ block.note || block.href }}</a>
  </p>

  <div v-else-if="block.kind === 'rows'" class="ls">
    <template v-for="(row, i) in block.rows" :key="i">
      <NuxtLink v-if="internal(row.href)" :to="row.href!" class="ls-row" :class="{ two: (block.cols || row.cells.length) === 2 }">
        <span v-for="(cell, j) in row.cells" :key="j" :class="j === 0 ? 'n' : j === row.cells.length - 1 ? '' : 'm'">{{ cell }}</span>
      </NuxtLink>
      <a v-else-if="row.href" :href="row.href" target="_blank" rel="noopener noreferrer" class="ls-row" :class="{ two: (block.cols || row.cells.length) === 2 }">
        <span v-for="(cell, j) in row.cells" :key="j" :class="j === 0 ? 'n' : j === row.cells.length - 1 ? '' : 'm'">{{ cell }}</span>
      </a>
      <div v-else class="ls-row" :class="{ two: (block.cols || row.cells.length) === 2 }">
        <span v-for="(cell, j) in row.cells" :key="j" :class="j === 0 ? 'cyan' : j === row.cells.length - 1 ? '' : 'm'">{{ cell }}</span>
      </div>
    </template>
  </div>
</template>
