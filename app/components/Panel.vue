<script setup lang="ts">
defineProps<{ title: string }>()
</script>

<template>
  <section class="panel">
    <h2 class="panel-title">
      <span class="dollar" aria-hidden="true">$</span>{{ title }}
    </h2>
    <slot />
  </section>
</template>
