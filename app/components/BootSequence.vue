<script setup lang="ts">
const emit = defineEmits<{ done: [] }>()
const site = useSite()
const reduced = useReducedMotion()
const line = ref(0)
const skipped = ref(false)

const lines = computed(() => site.boot)

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
    window.setTimeout(() => emit('done'), 280)
  }
}
</script>

<template>
  <div class="boot" role="dialog" aria-label="boot">
    <div class="boot-inner">
      <p v-for="(text, i) in lines" :key="text" class="muted">
        <span class="amber">$</span>
        <template v-if="i < line"> {{ text }}</template>
        <template v-else-if="i === line">
          <TypedText :text="' ' + text" @done="onLineDone" />
        </template>
      </p>
      <button class="skip" type="button" @click="skip">skip [enter]</button>
    </div>
  </div>
</template>
