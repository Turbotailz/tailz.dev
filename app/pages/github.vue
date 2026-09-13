<script setup lang="ts">
import { fetchGithubTelemetry } from '#shared/github'

const site = useSite()
const projects = useProjects()

const { data } = await useAsyncData('github', () => {
  const token = import.meta.server ? String(useRuntimeConfig().githubToken || '') : ''
  return fetchGithubTelemetry(token || undefined)
})

const gh = computed(() => data.value)
const pinned = computed(() => {
  const live = gh.value?.pinned?.length ? gh.value.pinned : []
  if (live.length) return live.slice(0, 6)
  return projects.map(p => ({
    name: p.slug,
    url: p.github,
    description: p.oneLiner
  }))
})

useSeoMeta({
  title: 'github',
  description: `GitHub profile for ${site.handle}`
})
</script>

<template>
  <div>
    <p class="muted">$ cd github && cat README</p>
    <section class="box">
      <h2>{{ site.handle }}</h2>
      <div class="wordmark">
        <img
          v-if="gh?.avatarUrl"
          class="avatar"
          :src="gh.avatarUrl"
          :alt="site.handle"
          width="72"
          height="72"
        >
        <div>
          <p style="margin-top: 0">
            <a :href="gh?.htmlUrl || site.github" rel="noopener noreferrer">github.com/{{ site.handle }}</a>
          </p>
          <p class="muted">
            {{ gh?.name || 'Sam Goodger' }}
            <template v-if="gh?.createdAt"> · since {{ gh.createdAt.slice(0, 4) }}</template>
            <template v-if="gh?.publicRepos"> · {{ gh.publicRepos }} public repos</template>
            <template v-if="gh?.followers"> · {{ gh.followers }} followers</template>
          </p>
          <p v-if="gh?.bio">{{ gh.bio }}</p>
          <p v-else class="muted">{{ site.tagline }}</p>
        </div>
      </div>
    </section>

    <section class="box">
      <h2>pinned</h2>
      <div class="stack">
        <a
          v-for="repo in pinned"
          :key="repo.url"
          :href="repo.url"
          rel="noopener noreferrer"
          class="row ls"
        >
          <span class="amber">{{ repo.name }}</span>
          <span />
          <span>{{ repo.description }}</span>
        </a>
      </div>
    </section>

    <section v-if="gh?.weeks?.length" class="box">
      <h2>contributions</h2>
      <ContribGraph :weeks="gh.weeks" />
      <p class="muted" style="margin: 0.75rem 0 0">. none · + some · # more · @ lots</p>
    </section>

    <section v-if="gh?.activity?.length" class="box">
      <h2>upstream / recent</h2>
      <div class="stack">
        <a
          v-for="item in gh.activity"
          :key="item.url + item.title"
          :href="item.url"
          rel="noopener noreferrer"
          class="row ls"
        >
          <span class="muted">{{ item.date }}</span>
          <span />
          <span>{{ item.title }}</span>
        </a>
      </div>
    </section>

    <p v-if="gh && !gh.ok" class="muted">
      telemetry offline — showing curated pins.
    </p>
  </div>
</template>
