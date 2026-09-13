<script setup lang="ts">
const emit = defineEmits<{ done: [] }>()
const site = useSite()
const reduced = useReducedMotion()
const line = ref(0)
const skipped = ref(false)

const lines = computed(() => site.boot)
const progress = computed(() => Math.round((line.value / lines.value.length) * 100))

function skip() {
  skipped.value = true
  line.value = lines.value.length
  emit('done')
}

onMounted(() => {
  if (reduced.value) skip()
})

function onLineDone() {
  if (skipped.value) return
  if (line.value < lines.value.length - 1) {
    line.value += 1
  } else {
    line.value += 1
    window.setTimeout(() => emit('done'), 420)
  }
}
</script>

<template>
  <div class="boot" role="dialog" aria-label="boot">
    <div class="boot-inner">
      <p v-for="(text, i) in lines.slice(0, Math.min(line + 1, lines.length))" :key="text" class="boot-line">
        <span class="ps">›&nbsp;</span>
        <template v-if="i < line">
          {{ text }} <span class="ok">[ ok ]</span>
        </template>
        <template v-else>
          <TypedText :text="text" :char-ms="14" @done="onLineDone" />
        </template>
      </p>
      <div class="boot-bar" aria-hidden="true"><i :style="{ width: `${progress}%` }" /></div>
      <button class="skip" type="button" @click="skip">skip [enter]</button>
    </div>
  </div>
</template>
