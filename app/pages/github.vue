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
    <p class="cmdline"><span class="ps">$</span> <span class="c">cd ~/github && neofetch</span></p>

    <Panel title="neofetch">
      <div class="neofetch">
        <div style="display: grid; gap: 0.75rem; justify-items: center">
          <img
            v-if="gh?.avatarUrl"
            class="avatar"
            :src="gh.avatarUrl"
            :alt="site.handle"
            width="96"
            height="96"
          >
          <TailsMark class="tails" style="width: 3rem" />
        </div>
        <dl class="kv">
          <dt>user</dt>
          <dd><a :href="gh?.htmlUrl || site.github" rel="noopener noreferrer">github.com/{{ site.handle }}</a></dd>
          <dt>name</dt>
          <dd>{{ gh?.name || 'Sam Goodger' }}</dd>
          <dt>since</dt>
          <dd>{{ gh?.createdAt?.slice(0, 4) || '2015' }}</dd>
          <template v-if="gh?.publicRepos">
            <dt>repos</dt>
            <dd>{{ gh.publicRepos }} public</dd>
          </template>
          <template v-if="gh?.followers">
            <dt>followers</dt>
            <dd>{{ gh.followers }}</dd>
          </template>
          <dt>bio</dt>
          <dd>{{ gh?.bio || site.tagline }}</dd>
          <dt>shell</dt>
          <dd>tailz-sh · nuxt 4 · cloudflare pages</dd>
        </dl>
      </div>
    </Panel>

    <Panel title="ls pinned/">
      <div class="cards">
        <a
          v-for="repo in pinned"
          :key="repo.url"
          :href="repo.url"
          rel="noopener noreferrer"
          class="card"
        >
          <div class="card-head">
            <span class="card-slug">{{ repo.name }}</span>
          </div>
          <p>{{ repo.description }}</p>
        </a>
      </div>
    </Panel>

    <Panel v-if="gh?.weeks?.length" title="git log --graph --all">
      <ContribGraph :weeks="gh.weeks" />
    </Panel>

    <Panel v-if="gh?.activity?.length" title="tail -f upstream">
      <div class="ls">
        <a
          v-for="item in gh.activity"
          :key="item.url + item.title"
          :href="item.url"
          rel="noopener noreferrer"
          class="ls-row two"
        >
          <span class="m">{{ item.date }}</span>
          <span>{{ item.title }}</span>
        </a>
      </div>
    </Panel>

    <p v-if="gh && !gh.ok" class="muted" style="margin-top: 1rem">
      telemetry offline — showing curated pins.
    </p>
  </div>
</template>
