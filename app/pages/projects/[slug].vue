<script setup lang="ts">
const route = useRoute()
const project = projectBySlug(String(route.params.slug))

if (!project) {
  throw createError({ statusCode: 404, statusMessage: 'No such project' })
}

useSeoMeta({
  title: project.name,
  description: project.oneLiner
})
</script>

<template>
  <div>
    <p class="muted">$ cat projects/{{ project.slug }}</p>
    <section class="box">
      <h2>{{ project.name }}</h2>
      <p>{{ project.oneLiner }}</p>
      <p class="muted">
        role: {{ project.role }}
        <template v-if="project.community">
          · community:
          <a :href="project.communityUrl" rel="noopener noreferrer">{{ project.community }}</a>
        </template>
      </p>
      <ul>
        <li v-for="b in project.bullets" :key="b">{{ b }}</li>
      </ul>
      <p class="muted" style="margin-bottom: 0">
        <a :href="project.github" rel="noopener noreferrer">github</a>
        <template v-if="project.upstream">
          · <a :href="project.upstream" rel="noopener noreferrer">upstream</a>
        </template>
        <template v-if="project.live">
          · <a :href="project.live" rel="noopener noreferrer">live</a>
        </template>
      </p>
    </section>
    <p class="muted">
      <NuxtLink to="/projects">cd ..</NuxtLink>
    </p>
  </div>
</template>
