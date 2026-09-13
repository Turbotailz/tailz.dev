<script setup lang="ts">
const shell = useShell()
const route = useRoute()
const pane = ref<HTMLElement | null>(null)

watch(() => route.path, async () => {
  await nextTick()
  pane.value?.scrollTo({ top: 0, behavior: 'instant' })
  shell.focus()
})
</script>

<template>
  <div class="term">
    <TerminalChrome />
    <SiteNav />
    <main id="pane" ref="pane" class="pane">
      <div class="pane-inner">
        <slot />
        <ShellLog />
      </div>
    </main>
    <ShellPrompt />
  </div>
</template>
