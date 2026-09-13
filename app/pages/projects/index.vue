<script setup lang="ts">
const projects = useProjects()

useSeoMeta({
  title: 'projects',
  description: 'Open source work by Turbotailz — LuckPerms, Syscraft, Morpheus, Athena.'
})
</script>

<template>
  <div>
    <p class="cmdline"><span class="ps">$</span> <span class="c">ls -la ~/projects</span></p>
    <p class="muted">{{ projects.length }} entries · rebuilds for communities, tools I author.</p>

    <Panel title="projects/">
      <div class="cards">
        <NuxtLink
          v-for="p in projects"
          :key="p.slug"
          :to="`/projects/${p.slug}`"
          class="card"
        >
          <div class="card-head">
            <span class="card-slug">{{ p.slug }}</span>
            <span class="badge" :class="{ mag: p.role === 'author' }">{{ p.role }}</span>
          </div>
          <p>{{ p.oneLiner }}</p>
          <p class="sub">
            {{ p.name }}<template v-if="p.community"> · {{ p.community }}</template>
          </p>
        </NuxtLink>
      </div>
    </Panel>
  </div>
</template>
