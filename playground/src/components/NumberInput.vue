<script setup lang="ts">
import { ref, watch } from "vue";

defineProps<{ label: string; disabled?: boolean }>();

const model = defineModel<number>({ required: true });
const text = ref(String(model.value));
const invalid = ref(false);

watch(model, (value) => {
  if (Number(text.value) !== value) {
    text.value = String(value);
  }
  invalid.value = false;
});

// Only finite numbers reach the options. The plugin itself rejects numbers it cannot use.
function commit(value: string) {
  text.value = value;
  const number = Number(value);
  invalid.value = value.trim() === "" || !Number.isFinite(number);
  if (!invalid.value) {
    model.value = number;
  }
}

function step(event: KeyboardEvent) {
  if (event.key !== "ArrowUp" && event.key !== "ArrowDown") {
    return;
  }
  event.preventDefault();
  const size = event.shiftKey ? 10 : 1;
  commit(String(model.value + (event.key === "ArrowUp" ? size : -size)));
}
</script>

<template>
  <input
    class="number"
    :class="{ invalid }"
    type="text"
    inputmode="decimal"
    spellcheck="false"
    :value="text"
    :aria-label="label"
    :aria-invalid="invalid"
    :disabled="disabled"
    @input="commit(($event.target as HTMLInputElement).value)"
    @keydown="step"
  >
</template>

<style scoped>
.number {
  flex: none;
  width: 84px;
  height: 30px;
  padding: 0 10px;
  border: 1px solid var(--line);
  border-radius: 8px;
  background: var(--surface);
  font-family: var(--mono);
  font-size: 13px;
  text-align: right;
  font-variant-numeric: tabular-nums;
  transition:
    border-color 0.15s,
    box-shadow 0.15s;
}

.number:hover:not(:disabled) {
  border-color: var(--line-strong);
}

.number:focus {
  outline: none;
  border-color: var(--accent);
  box-shadow: 0 0 0 3px var(--accent-soft);
}

.number.invalid {
  border-color: var(--danger);
  box-shadow: 0 0 0 3px var(--danger-soft);
}

.number:disabled {
  cursor: not-allowed;
  opacity: 0.45;
}
</style>
