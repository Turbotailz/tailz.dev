<script setup lang="ts">
const flicker = ref(false)

onMounted(() => {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
  if (sessionStorage.getItem('tailz:power')) return
  sessionStorage.setItem('tailz:power', '1')
  flicker.value = true
})
</script>

<template>
  <div :class="{ flicker }">
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </div>
  <div class="vignette" aria-hidden="true" />
  <div class="scanlines" aria-hidden="true" />
</template>
