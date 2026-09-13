<script setup lang="ts">
const site = useSite()
const projects = useProjects()
const featured = computed(() => projects.filter(p => p.featured))
const booting = ref(true)
const reduced = useReducedMotion()

onMounted(() => {
  if (reduced.value) booting.value = false
  const onKey = (e: KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === 'Escape') booting.value = false
  }
  window.addEventListener('keydown', onKey)
  onUnmounted(() => window.removeEventListener('keydown', onKey))
})

useSeoMeta({
  title: 'Turbotailz',
  description: site.offer
})
</script>

<template>
  <div>
    <ClientOnly>
      <BootSequence v-if="booting" @done="booting = false" />
    </ClientOnly>

    <AsciiWordmark />

    <p class="muted" style="margin: 1.25rem 0 0.25rem">
      $ whoami
    </p>
    <p>
      <strong>{{ site.handle }}</strong>
      <span class="muted"> — {{ site.tagline }}</span>
    </p>

    <section class="box" style="margin-top: 1.5rem">
      <h2>ls projects — featured</h2>
      <div class="stack">
        <NuxtLink
          v-for="p in featured"
          :key="p.slug"
          :to="`/projects/${p.slug}`"
          class="row ls"
        >
          <span class="amber">{{ p.slug }}/</span>
          <span class="muted">{{ p.role }}</span>
          <span>{{ p.oneLiner }}</span>
        </NuxtLink>
      </div>
      <p class="muted" style="margin: 0.9rem 0 0">
        <NuxtLink to="/projects">ls projects</NuxtLink>
        <span> for the full list</span>
      </p>
    </section>

    <section class="box">
      <h2>offer</h2>
      <p style="margin: 0">{{ site.offer }}</p>
      <p class="muted" style="margin: 0.75rem 0 0">
        <a :href="site.github" rel="noopener noreferrer">GitHub/{{ site.handle }}</a>
        <span> · Discord @{{ site.discordHandle }}</span>
        <span> · </span>
        <a :href="`mailto:${site.email}`">{{ site.email }}</a>
      </p>
    </section>

    <section class="box">
      <h2>communities</h2>
      <div class="stack">
        <a
          v-for="c in site.communities"
          :key="c.href"
          :href="c.href"
          rel="noopener noreferrer"
          class="row ls"
        >
          <span class="amber">{{ c.name }}</span>
          <span class="muted">{{ c.note }}</span>
          <span class="muted">{{ c.href.replace('https://', '') }}</span>
        </a>
      </div>
      <p class="muted" style="margin: 0.9rem 0 0">
        tools I build with:
        <NuxtLink v-for="chip in site.useChips" :key="chip" class="chip" to="/uses" style="margin-left: 0.35rem">{{ chip }}</NuxtLink>
      </p>
    </section>

    <p class="muted" style="margin-top: 1.25rem">
      $ <span class="amber">ls projects</span> · <span class="amber">cat uses</span> · <span class="amber">cd github</span>
    </p>
  </div>
</template>
