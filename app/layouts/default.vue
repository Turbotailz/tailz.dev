<script setup lang="ts">
const site = useSite()
const route = useRoute()

const cwd = computed(() => {
  if (route.path === '/') return '~'
  return `~${route.path.replace(/\/$/, '')}`
})

const links = [
  { to: '/', label: 'cd ~', exact: true },
  { to: '/projects', label: 'ls projects' },
  { to: '/uses', label: 'cat uses' },
  { to: '/github', label: 'cd github' },
  { to: '/whoami', label: 'cat whoami' }
]
</script>

<template>
  <div class="wrap">
    <header class="bar">
      <div class="prompt">
        <strong>{{ site.prompt }}</strong>
        <span class="muted"> {{ cwd }}</span>
      </div>
      <nav class="nav" aria-label="site">
        <NuxtLink
          v-for="link in links"
          :key="link.to"
          :to="link.to"
          :class="{ 'router-link-active': link.to === '/' ? route.path === '/' : route.path.startsWith(link.to) }"
          :aria-current="(link.to === '/' ? route.path === '/' : route.path.startsWith(link.to)) ? 'page' : undefined"
        >
          {{ link.label }}
        </NuxtLink>
      </nav>
    </header>
    <slot />
    <footer class="footer">
      <span>tailz.dev · OSS home · not a studio</span>
      <a :href="site.github" rel="noopener noreferrer">{{ site.github.replace('https://', '') }}</a>
    </footer>
  </div>
</template>
