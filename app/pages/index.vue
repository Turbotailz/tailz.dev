<script setup lang="ts">
const site = useSite()
const projects = useProjects()
const shell = useShell()
const featured = computed(() => projects.filter(p => p.featured))
const booting = ref(false)
const reduced = useReducedMotion()

onMounted(() => {
  if (reduced.value) return
  if (sessionStorage.getItem('tailz:booted')) return
  booting.value = true
  const onKey = (e: KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === 'Escape') booted()
  }
  window.addEventListener('keydown', onKey)
  onUnmounted(() => window.removeEventListener('keydown', onKey))
})

function booted() {
  booting.value = false
  try { sessionStorage.setItem('tailz:booted', '1') } catch { /* ignore */ }
}

function tryCommand(cmd: string) {
  shell.run(cmd)
}

useSeoMeta({
  title: 'Turbotailz',
  description: site.offer
})
</script>

<template>
  <div>
    <ClientOnly>
      <BootSequence v-if="booting" @done="booted" />
    </ClientOnly>

    <section class="hero">
      <div class="hero-grid" aria-hidden="true" />
      <div class="hero-row">
        <TailsMark class="tails" />
        <AsciiWordmark />
      </div>
      <p class="tagline">
        <span class="cyan">$</span> whoami<br>
        <strong>{{ site.handle }}</strong> — {{ site.tagline }}
      </p>
      <p class="hint">
        type <kbd>help</kbd> or press <kbd>/</kbd> to use the shell · or just click around
      </p>
    </section>

    <Panel title="ls projects --featured">
      <div class="cards">
        <NuxtLink
          v-for="p in featured"
          :key="p.slug"
          :to="`/projects/${p.slug}`"
          class="card"
        >
          <div class="card-head">
            <span class="card-slug">{{ p.slug }}</span>
            <span class="badge">{{ p.role }}</span>
          </div>
          <p>{{ p.oneLiner }}</p>
          <p v-if="p.community" class="sub">{{ p.community }}</p>
        </NuxtLink>
      </div>
      <p class="muted" style="margin: 1rem 0 0">
        <NuxtLink to="/projects">cd projects</NuxtLink>
        <span> for the full list</span>
      </p>
    </Panel>

    <div class="grid-2">
      <Panel title="cat offer">
        <p style="font-size: 1.05em">{{ site.offer }}</p>
        <div class="links">
          <a :href="site.github" rel="noopener noreferrer">github/{{ site.handle }}</a>
          <span>discord @{{ site.discordHandle }}</span>
          <a :href="`mailto:${site.email}`">{{ site.email }}</a>
        </div>
      </Panel>

      <Panel title="ls communities">
        <div class="ls">
          <a
            v-for="c in site.communities"
            :key="c.href"
            :href="c.href"
            rel="noopener noreferrer"
            class="ls-row two"
          >
            <span class="n">{{ c.name }}</span>
            <span class="m">{{ c.note }} · {{ c.href.replace('https://', '') }}</span>
          </a>
        </div>
        <p class="muted" style="margin: 1rem 0 0.4rem">built with</p>
        <div class="chips">
          <NuxtLink v-for="chip in site.useChips" :key="chip" class="chip" to="/uses">{{ chip }}</NuxtLink>
        </div>
      </Panel>
    </div>

    <p class="hint" style="margin-top: 1.5rem">
      try:
      <button type="button" class="chip" @click="tryCommand('ls projects')">ls projects</button>
      <button type="button" class="chip" @click="tryCommand('cat whoami')">cat whoami</button>
      <button type="button" class="chip" @click="tryCommand('neofetch')">neofetch</button>
      <button type="button" class="chip" @click="tryCommand('open discord')">open discord</button>
    </p>
  </div>
</template>

<style scoped>
button.chip {
  background: none;
  font-family: inherit;
  cursor: pointer;
  margin-right: 0.3rem;
}
</style>
