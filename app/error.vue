<script setup lang="ts">
const error = useError()
const route = useRoute()
const code = computed(() => error.value?.statusCode || 500)
</script>

<template>
  <NuxtLayout>
    <div>
      <p class="cmdline"><span class="ps">$</span> <span class="c">cat {{ route.path }}</span></p>
      <p class="blk-error">
        tailz-sh: {{ code === 404 ? 'no such file or directory' : (error?.statusMessage || 'something broke') }}: {{ route.path }}
      </p>
      <div class="err-code" aria-hidden="true">{{ code }}</div>
      <p class="hint" style="margin-top: 1rem">
        try <NuxtLink to="/" @click="clearError()">cd ~</NuxtLink> or <NuxtLink to="/projects" @click="clearError()">ls projects</NuxtLink>
      </p>
    </div>
  </NuxtLayout>
  <div class="vignette" aria-hidden="true" />
  <div class="scanlines" aria-hidden="true" />
</template>
