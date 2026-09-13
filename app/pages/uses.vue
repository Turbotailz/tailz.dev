<script setup lang="ts">
const groups = useUses()

useSeoMeta({
  title: 'uses',
  description: 'Open source tools Turbotailz builds with — user, not maintainer.'
})
</script>

<template>
  <div>
    <p class="cmdline"><span class="ps">$</span> <span class="c">cat ~/uses</span></p>
    <p class="muted">builder-on-top-of. not maintainer.</p>

    <div class="grid-2">
      <Panel v-for="group in groups" :key="group.group" :title="group.group">
        <div class="ls">
          <a
            v-for="item in group.items"
            :key="item.name"
            :href="item.href"
            rel="noopener noreferrer"
            class="ls-row two"
          >
            <span class="n">{{ item.name }}</span>
            <span>{{ item.note }}</span>
          </a>
        </div>
      </Panel>
    </div>
  </div>
</template>
