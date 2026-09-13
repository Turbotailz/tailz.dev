<script setup lang="ts">
const site = useSite()
const shell = useShell()
const clock = ref('')
let timer: ReturnType<typeof setInterval> | undefined

function tick() {
  const d = new Date()
  clock.value = d.toLocaleTimeString('en-AU', { hour: '2-digit', minute: '2-digit', hour12: false })
}

onMounted(() => {
  tick()
  timer = setInterval(tick, 15_000)
})

onUnmounted(() => {
  if (timer) clearInterval(timer)
})
</script>

<template>
  <header class="chrome">
    <div class="dots" aria-hidden="true">
      <span class="dot mag" />
      <span class="dot violet" />
      <span class="dot cyan" />
    </div>
    <div class="chrome-title">
      <TailsMark class="tails sm" aria-hidden="true" style="vertical-align: -0.2em; margin-right: 0.4rem" />
      <span class="host">{{ site.prompt }}</span>: {{ shell.cwd.value }}
    </div>
    <div class="chrome-right">
      <span v-if="clock" aria-label="local time">{{ clock }}</span>
      <span class="led" aria-hidden="true" /><span class="sr-only">online</span>
    </div>
  </header>
</template>
