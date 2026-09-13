<script setup lang="ts">
const groups = useUses()

useSeoMeta({
  title: 'uses',
  description: 'Open source tools Turbotailz builds with — user, not maintainer.'
})
</script>

<template>
  <div>
    <p class="muted">$ cat uses</p>
    <p class="muted">builder-on-top-of. not maintainer.</p>
    <section v-for="group in groups" :key="group.group" class="box">
      <h2>{{ group.group }}</h2>
      <div class="stack">
        <a
          v-for="item in group.items"
          :key="item.name"
          :href="item.href"
          rel="noopener noreferrer"
          class="row ls"
        >
          <span class="amber">{{ item.name }}</span>
          <span />
          <span>{{ item.note }}</span>
        </a>
      </div>
    </section>
  </div>
</template>
