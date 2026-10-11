<script setup lang="ts">
defineProps<{ label: string; disabled?: boolean }>();

const model = defineModel<boolean>({ required: true });
</script>

<template>
  <button
    type="button"
    role="switch"
    class="switch"
    :class="{ on: model }"
    :aria-checked="model"
    :aria-label="label"
    :disabled="disabled"
    @click="model = !model"
  >
    <span class="knob" />
  </button>
</template>

<style scoped>
.switch {
  position: relative;
  flex: none;
  width: 34px;
  height: 20px;
  border-radius: 999px;
  background: var(--switch-off);
  transition: background-color 0.18s;
}

.switch.on {
  background: var(--accent-strong);
}

.knob {
  position: absolute;
  top: 2px;
  left: 2px;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: #fff;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
  transition: transform 0.18s;
}

.switch.on .knob {
  transform: translateX(14px);
}

.switch:disabled {
  cursor: not-allowed;
  opacity: 0.4;
}
</style>
