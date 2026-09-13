<script setup lang="ts">
import { WORDMARK_FULL, WORDMARK_TAILZ, WORDMARK_TURBO } from '~/utils/shell/ascii'

const stacked = `${WORDMARK_TURBO}\n${WORDMARK_TAILZ}`
</script>

<template>
  <div class="wordmark" role="img" aria-label="TURBOTAILZ">
    <div class="full">
      <pre class="ascii ghost r" aria-hidden="true">{{ WORDMARK_FULL }}</pre>
      <pre class="ascii ghost b" aria-hidden="true">{{ WORDMARK_FULL }}</pre>
      <pre class="ascii" aria-hidden="true">{{ WORDMARK_FULL }}</pre>
    </div>
    <div class="stacked">
      <pre class="ascii" aria-hidden="true">{{ stacked }}</pre>
    </div>
  </div>
</template>
