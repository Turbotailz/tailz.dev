<script setup lang="ts">
const shell = useShell()
const route = useRoute()
const pane = ref<HTMLElement | null>(null)

watch(() => route.path, async () => {
  await nextTick()
  pane.value?.scrollTo({ top: 0, behavior: 'instant' })
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
        <p class="muted" style="margin-top: 2rem; font-size: 0.8em">
          tailz.dev · OSS home · not a studio ·
          <a :href="shell.site.github" rel="noopener noreferrer">{{ shell.site.github.replace('https://', '') }}</a>
        </p>
      </div>
    </main>
    <ShellPrompt />
  </div>
</template>
