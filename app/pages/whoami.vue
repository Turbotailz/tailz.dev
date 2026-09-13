<script setup lang="ts">
const site = useSite()

useSeoMeta({
  title: 'whoami',
  description: site.whoami
})
</script>

<template>
  <div>
    <p class="muted">$ cat whoami</p>
    <section class="box">
      <h2>whoami</h2>
      <p>{{ site.whoami }}</p>
      <p>{{ site.offer }}</p>
      <p class="muted">
        <a :href="site.github" rel="noopener noreferrer">GitHub/{{ site.handle }}</a>
        · Discord @{{ site.discordHandle }}
        · <a :href="`mailto:${site.email}`">{{ site.email }}</a>
      </p>
    </section>
    <section class="box">
      <h2>other homes</h2>
      <p class="muted">this site is OSS only.</p>
      <div class="stack">
        <a
          v-for="home in site.homes"
          :key="home.href"
          :href="home.href"
          rel="noopener noreferrer"
          class="row ls"
        >
          <span class="amber">{{ home.label }}</span>
          <span class="muted">{{ home.note }}</span>
          <span />
        </a>
      </div>
    </section>
  </div>
</template>
