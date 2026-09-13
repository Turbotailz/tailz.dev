<script setup lang="ts">
const props = defineProps<{
  weeks: { date: string, count: number }[][]
}>()

function level(count: number) {
  if (count <= 0) return ''
  if (count < 2) return 'l1'
  if (count < 5) return 'l2'
  if (count < 10) return 'l3'
  return 'l4'
}

function glyph(count: number) {
  if (count <= 0) return '.'
  if (count < 2) return '+'
  if (count < 5) return '#'
  return '@'
}

const total = computed(() => props.weeks.flat().reduce((n, d) => n + d.count, 0))
const cells = computed(() => props.weeks.flatMap(week =>
  Array.from({ length: 7 }, (_, day) => week[day] ?? { date: '', count: -1 })
))
const ascii = computed(() =>
  [0, 1, 2, 3, 4, 5, 6].map(day => props.weeks.map(w => glyph(w[day]?.count ?? 0)).join('')).join('\n')
)
</script>

<template>
  <div>
    <div class="contrib-wrap">
      <div class="contrib" aria-hidden="true">
        <i
          v-for="(d, i) in cells"
          :key="i"
          :class="level(d.count)"
          :style="d.count < 0 ? 'visibility: hidden' : undefined"
          :title="d.date ? `${d.date}: ${d.count}` : undefined"
        />
      </div>
    </div>
    <pre class="sr-only" aria-label="contribution graph, text form">{{ ascii }}</pre>
    <div class="contrib-legend">
      <span>{{ total }} contributions in the last year</span>
      <span style="margin-left: auto">less</span>
      <i /><i class="l1" /><i class="l2" /><i class="l3" /><i class="l4" />
      <span>more</span>
    </div>
  </div>
</template>
