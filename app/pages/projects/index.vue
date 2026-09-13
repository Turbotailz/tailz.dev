<script setup lang="ts">
const projects = useProjects()

useSeoMeta({
  title: 'projects',
  description: 'Open source work by Turbotailz — LuckPerms, Syscraft, Morpheus, Athena.'
})
</script>

<template>
  <div>
    <p class="muted">$ ls -l projects</p>
    <section class="box">
      <h2>projects</h2>
      <div class="stack">
        <NuxtLink
          v-for="p in projects"
          :key="p.slug"
          :to="`/projects/${p.slug}`"
          class="row ls"
        >
          <span class="amber">{{ p.slug }}/</span>
          <span class="muted">{{ p.role }}</span>
          <span>{{ p.oneLiner }}</span>
        </NuxtLink>
      </div>
    </section>
  </div>
</template>
