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
    <p class="cmdline"><span class="ps">$</span> <span class="c">cat ~/projects/{{ project.slug }}/README</span></p>

    <Panel :title="`${project.slug}/README`">
      <div class="card-head" style="margin-bottom: 0.5rem">
        <h1 class="mag glow-mag" style="margin: 0; font-size: 1.4em">{{ project.name }}</h1>
        <span class="badge" :class="{ mag: project.role === 'author' }">{{ project.role }}</span>
      </div>
      <p style="font-size: 1.05em">{{ project.oneLiner }}</p>
      <ul>
        <li v-for="b in project.bullets" :key="b">{{ b }}</li>
      </ul>
      <p v-if="project.community" class="muted">
        community: <a :href="project.communityUrl" rel="noopener noreferrer">{{ project.community }}</a>
      </p>
    </Panel>

    <Panel :title="`ls ${project.slug}/`">
      <div class="ls">
        <a :href="project.github" rel="noopener noreferrer" class="ls-row">
          <span class="n">github@</span>
          <span class="m">source</span>
          <span>{{ project.github.replace('https://', '') }}</span>
        </a>
        <a v-if="project.upstream" :href="project.upstream" rel="noopener noreferrer" class="ls-row">
          <span class="n">upstream@</span>
          <span class="m">upstream repo</span>
          <span>{{ project.upstream.replace('https://', '') }}</span>
        </a>
        <a v-if="project.live" :href="project.live" rel="noopener noreferrer" class="ls-row">
          <span class="n">live@</span>
          <span class="m">deployed</span>
          <span>{{ project.live.replace('https://', '') }}</span>
        </a>
        <a v-if="project.communityUrl" :href="project.communityUrl" rel="noopener noreferrer" class="ls-row">
          <span class="n">discord@</span>
          <span class="m">community</span>
          <span>{{ project.communityUrl.replace('https://', '') }}</span>
        </a>
      </div>
    </Panel>

    <p class="muted" style="margin-top: 1.25rem">
      <NuxtLink to="/projects">cd ..</NuxtLink>
    </p>
  </div>
</template>
