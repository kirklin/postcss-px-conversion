<script setup lang="ts">
import Footer from "./Footer/index.vue";
import Container from "./Container/index.vue";

defineOptions({
  name: "Layout",
});
</script>

<template>
  <div class="font-chinese antialiased">
    <!--    <Navbar /> -->
    <Container>
      <RouterView />
    </Container>
    <Footer />
  </div>
</template>

<style scoped>

</style>
