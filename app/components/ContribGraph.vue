<script setup lang="ts">
defineProps<{
  weeks: { date: string, count: number }[][]
}>()

function cell(count: number) {
  if (count <= 0) return '.'
  if (count < 2) return '+'
  if (count < 5) return '#'
  return '@'
}
</script>

<template>
  <pre class="contrib ascii" aria-label="contribution graph">{{
    [0, 1, 2, 3, 4, 5, 6].map((day) =>
      weeks.map(week => cell(week[day]?.count ?? 0)).join('')
    ).join('\n')
  }}</pre>
</template>
