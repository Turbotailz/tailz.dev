<script setup lang="ts">
const props = withDefaults(defineProps<{
  text: string
  charMs?: number
  start?: boolean
}>(), {
  charMs: 22,
  start: true
})

const emit = defineEmits<{ done: [] }>()
const shown = ref('')
const reduced = useReducedMotion()
let timer: ReturnType<typeof setInterval> | undefined

function finish() {
  shown.value = props.text
  emit('done')
}

watch(
  () => [props.text, props.start] as const,
  () => {
    if (timer) clearInterval(timer)
    shown.value = ''
    if (!props.start) return
    if (import.meta.server || reduced.value) {
      finish()
      return
    }
    let i = 0
    timer = setInterval(() => {
      i += 1
      shown.value = props.text.slice(0, i)
      if (i >= props.text.length) {
        clearInterval(timer)
        emit('done')
      }
    }, props.charMs)
  },
  { immediate: true }
)

onUnmounted(() => {
  if (timer) clearInterval(timer)
})
</script>

<template>
  <span>{{ shown }}<span v-if="shown !== text" class="cursor" aria-hidden="true" /></span>
</template>
