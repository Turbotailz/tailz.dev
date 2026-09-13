<script setup lang="ts">
const site = useSite()

useSeoMeta({
  title: 'whoami',
  description: site.whoami
})
</script>

<template>
  <div>
    <p class="cmdline"><span class="ps">$</span> <span class="c">cat ~/whoami</span></p>

    <Panel title="whoami">
      <p style="font-size: 1.05em">{{ site.whoami }}</p>
      <p class="mag glow-mag" style="font-size: 1.05em">{{ site.offer }}</p>
      <div class="links">
        <a :href="site.github" rel="noopener noreferrer">github/{{ site.handle }}</a>
        <span>discord @{{ site.discordHandle }}</span>
        <a :href="`mailto:${site.email}`">{{ site.email }}</a>
      </div>
    </Panel>

    <Panel title="ls ~/homes">
      <p class="muted">this site is OSS only. the rest of me lives elsewhere.</p>
      <div class="ls">
        <a
          v-for="home in site.homes"
          :key="home.href"
          :href="home.href"
          rel="noopener noreferrer"
          class="ls-row two"
        >
          <span class="n">{{ home.label }}@</span>
          <span class="m">{{ home.note }}</span>
        </a>
      </div>
    </Panel>
  </div>
</template>
