<script setup lang="ts">
defineOptions({
  name: "FooterLayout",
});
</script>

<template>
  <VanTabbar route>
    <VanTabbarItem to="/home" icon="home-o">
      首页
    </VanTabbarItem>
    <VanTabbarItem to="/info" icon="info-o">
      资讯中心
    </VanTabbarItem>
    <VanTabbarItem
      to="/trending"
      icon="chart-trending-o"
    >
      趋势分析
    </VanTabbarItem>
    <VanTabbarItem to="/user" icon="user-o">
      个人中心
    </VanTabbarItem>
  </VanTabbar>
</template>
