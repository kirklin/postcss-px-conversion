<script setup lang="ts" generic="T extends string | number">
defineProps<{
  choices: readonly T[];
  label: string;
  // Returns why a choice cannot be picked
  disabledReason?: (choice: T) => string | undefined;
}>();

const model = defineModel<T>({ required: true });
</script>

<template>
  <div class="segmented" role="radiogroup" :aria-label="label">
    <button
      v-for="choice in choices"
      :key="choice"
      type="button"
      role="radio"
      class="segment"
      :class="{ on: choice === model }"
      :aria-checked="choice === model"
      :disabled="disabledReason?.(choice) !== undefined"
      :title="disabledReason?.(choice)"
      @click="model = choice"
    >
      {{ choice }}
    </button>
  </div>
</template>

<style scoped>
.segmented {
  display: inline-flex;
  flex-wrap: wrap;
  gap: 2px;
  padding: 3px;
  border-radius: 10px;
  background: var(--surface-sunken);
}

.segment {
  min-width: 34px;
  height: 26px;
  padding: 0 8px;
  border-radius: 7px;
  font-family: var(--mono);
  font-size: 12px;
  font-variant-ligatures: none;
  color: var(--muted);
  transition:
    color 0.15s,
    background-color 0.15s;
}

.segment:hover:not(:disabled, .on) {
  color: var(--ink);
}

.segment.on {
  background: var(--surface);
  color: var(--ink);
  box-shadow:
    0 1px 2px rgba(24, 24, 27, 0.1),
    inset 0 0 0 1px var(--line);
}

.segment:disabled {
  cursor: not-allowed;
  opacity: 0.38;
}
</style>
