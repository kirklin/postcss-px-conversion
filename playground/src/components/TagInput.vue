<script setup lang="ts">
import { ref, useTemplateRef } from "vue";
import { t } from "~/lib/i18n";
import { isRegExpEntry } from "~/lib/options";

defineProps<{ label: string; patterns: boolean }>();

const model = defineModel<string[]>({ required: true });
const draft = ref("");
const input = useTemplateRef<HTMLInputElement>("input");

function add() {
  const entry = draft.value.trim();
  if (entry !== "" && !model.value.includes(entry)) {
    model.value = [...model.value, entry];
  }
  draft.value = "";
}

function remove(index: number) {
  model.value = model.value.filter((_, position) => position !== index);
}

function onKeydown(event: KeyboardEvent) {
  if (event.key === "Enter") {
    event.preventDefault();
    add();
  } else if (event.key === "Backspace" && draft.value === "" && model.value.length > 0) {
    remove(model.value.length - 1);
  }
}
</script>

<template>
  <div class="tags" @click="input?.focus()">
    <span
      v-for="(entry, index) in model"
      :key="entry"
      class="tag"
      :class="{ pattern: patterns && isRegExpEntry(entry) }"
      :title="patterns && isRegExpEntry(entry) ? t.regex : undefined"
    >
      {{ entry }}
      <button type="button" class="tag-remove" :aria-label="t.remove(entry)" @click.stop="remove(index)">
        <svg width="10" height="10" viewBox="0 0 10 10" aria-hidden="true">
          <path d="M2 2L8 8M8 2L2 8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
        </svg>
      </button>
    </span>
    <input
      ref="input"
      v-model="draft"
      class="tag-input"
      spellcheck="false"
      :aria-label="label"
      :placeholder="model.length === 0 ? t.listPlaceholder : ''"
      @keydown="onKeydown"
      @blur="add"
    >
  </div>
</template>

<style scoped>
.tags {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 4px;
  min-height: 34px;
  padding: 3px 4px;
  border: 1px solid var(--line);
  border-radius: 8px;
  background: var(--surface);
  cursor: text;
  transition:
    border-color 0.15s,
    box-shadow 0.15s;
}

.tags:hover {
  border-color: var(--line-strong);
}

.tags:focus-within {
  border-color: var(--accent);
  box-shadow: 0 0 0 3px var(--accent-soft);
}

.tag {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  height: 24px;
  padding: 0 4px 0 8px;
  border-radius: 6px;
  background: var(--surface-sunken);
  font-family: var(--mono);
  font-size: 12px;
  font-variant-ligatures: none;
  color: var(--ink-2);
}

.tag.pattern {
  background: var(--accent-soft);
  color: var(--accent);
  box-shadow: inset 0 0 0 1px var(--accent-ring);
}

.tag-remove {
  display: grid;
  place-items: center;
  width: 16px;
  height: 16px;
  border-radius: 4px;
  color: var(--faint);
}

.tag-remove:hover {
  background: var(--line);
  color: var(--ink);
}

.tag-input {
  flex: 1;
  min-width: 80px;
  height: 24px;
  padding: 0 4px;
  border: 0;
  background: transparent;
  font-family: var(--mono);
  font-size: 12px;
  font-variant-ligatures: none;
}

.tag-input:focus {
  outline: none;
}

.tag-input::placeholder {
  font-family: var(--sans);
  color: var(--faint);
}
</style>
