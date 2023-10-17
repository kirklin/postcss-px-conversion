<script setup lang="ts">
defineOptions({
  name: "Container",
});
</script>

<template>
  <div class="container">
    <slot />
  </div>
</template>

<style scoped>
.container {
  width: 100%;
  height: 100%;
  padding: 0;
}

[data-theme='dark'] {
  .data-content {
    background: #222;
    color: #fff;
  }
}
</style>
