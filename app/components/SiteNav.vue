<script setup lang="ts">
const route = useRoute()

const links = [
  { to: '/', label: '~', key: '1' },
  { to: '/projects', label: 'projects', key: '2' },
  { to: '/uses', label: 'uses', key: '3' },
  { to: '/github', label: 'github', key: '4' },
  { to: '/whoami', label: 'whoami', key: '5' }
]

function active(to: string) {
  return to === '/' ? route.path === '/' : route.path.startsWith(to)
}
</script>

<template>
  <nav class="tabs" aria-label="site">
    <NuxtLink
      v-for="link in links"
      :key="link.to"
      :to="link.to"
      class="tab"
      :aria-current="active(link.to) ? 'page' : undefined"
    >
      <span class="k" aria-hidden="true">{{ link.key }}</span>{{ link.label }}
    </NuxtLink>
  </nav>
</template>
