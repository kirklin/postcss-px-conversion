<script setup lang="ts">
import type { ConfigProviderTheme } from "vant";
import { logger } from "@kirklin/logger";

const theme = ref<ConfigProviderTheme>("light");

logger.info("I'm ready!  ⸜(๑'ᵕ'๑)⸝⋆*");
</script>

<template>
  <VanConfigProvider :theme="theme">
    <RouterView />
  </VanConfigProvider>
</template>
