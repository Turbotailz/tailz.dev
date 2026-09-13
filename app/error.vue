<script setup lang="ts">
const error = useError()
</script>

<template>
  <div class="wrap">
    <p class="muted">$ cat {{ error?.statusCode || 500 }}</p>
    <section class="box">
      <h2>no such file</h2>
      <p>{{ error?.statusMessage || 'something broke' }}</p>
      <p class="muted"><NuxtLink to="/">cd ~</NuxtLink></p>
    </section>
  </div>
</template>
