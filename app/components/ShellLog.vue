<script setup lang="ts">
const shell = useShell()
const site = useSite()
const anchor = ref<HTMLElement | null>(null)

watch(() => shell.entries.value.length, async () => {
  const last = shell.entries.value[shell.entries.value.length - 1]
  if (!last?.blocks.length) return
  await nextTick()
  anchor.value?.scrollIntoView({ block: 'end' })
})
</script>

<template>
  <section v-if="shell.entries.value.length" class="shell-log" aria-live="polite" aria-label="shell output">
    <div v-for="entry in shell.entries.value" :key="entry.id" class="entry">
      <p class="entry-cmd">
        <span class="cyan">{{ site.prompt }}</span><span>:</span><span class="mag">{{ entry.cwd }}</span><span>$ </span>
        <span class="cmd">{{ entry.input }}</span>
      </p>
      <div v-if="entry.blocks.length" class="entry-out">
        <ShellBlock v-for="(block, i) in entry.blocks" :key="i" :block="block" />
      </div>
    </div>
    <span ref="anchor" aria-hidden="true" />
  </section>
</template>
