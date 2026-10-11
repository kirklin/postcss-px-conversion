<script setup lang="ts">
import type { Field, FieldGroup } from "~/lib/fields";
import type { GroupId } from "~/lib/i18n";
import type { OptionKey, PlaygroundOptions } from "~/lib/options";
import { computed, reactive } from "vue";
import NumberInput from "~/components/NumberInput.vue";
import SegmentedControl from "~/components/SegmentedControl.vue";
import TagInput from "~/components/TagInput.vue";
import ToggleSwitch from "~/components/ToggleSwitch.vue";
import { exampleById, EXAMPLES } from "~/lib/examples";
import { FIELD_GROUPS } from "~/lib/fields";
import { locale, t } from "~/lib/i18n";
import { DEFAULT_PLAYGROUND_OPTIONS, formatValue, isDefault, isPatternList, unsupportedTarget } from "~/lib/options";

const props = defineProps<{ example: string }>();
const emit = defineEmits<{ selectExample: [id: string]; reset: [] }>();
const options = defineModel<PlaygroundOptions>("options", { required: true });
const file = defineModel<string>("file", { required: true });

const open = reactive<Record<GroupId, boolean>>({ units: true, values: true, filters: true, media: true, files: true });
const description = computed(() => exampleById(props.example).description[locale.value]);

function update<K extends OptionKey>(key: K, value: PlaygroundOptions[K]) {
  options.value = { ...options.value, [key]: value };
}

function fieldId(field: Field): OptionKey | "file" {
  return field.kind === "file" ? "file" : field.key;
}

function changed(field: Field): boolean {
  return field.kind !== "file" && !isDefault(field.key, options.value[field.key]);
}

function changedCount(group: FieldGroup): number {
  return group.fields.filter(changed).length;
}

function defaultText(field: Field): string {
  return field.kind === "file" ? "" : formatValue(field.key, DEFAULT_PLAYGROUND_OPTIONS[field.key]);
}

function inactive(field: Field): boolean {
  return "requires" in field && field.requires !== undefined && !options.value[field.requires];
}

function targetReason(choice: string): string | undefined {
  const reason = unsupportedTarget(options.value.unitType, choice);
  if (reason === "same") {
    return t.value.sameUnit;
  }
  if (reason === "px") {
    return t.value.needsRem;
  }
  return reason === "rem" ? t.value.needsPx : undefined;
}
</script>

<template>
  <aside class="options">
    <div class="options-scroll">
      <div class="example">
        <label class="example-label" for="example-select">{{ t.example }}</label>
        <div class="select">
          <select
            id="example-select"
            :value="example"
            @change="emit('selectExample', ($event.target as HTMLSelectElement).value)"
          >
            <option v-for="item in EXAMPLES" :key="item.id" :value="item.id">
              {{ item.title[locale] }}
            </option>
          </select>
          <svg class="select-icon" width="12" height="12" viewBox="0 0 12 12" aria-hidden="true">
            <path d="M3 4.5L6 7.5L9 4.5" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
        </div>
        <p class="example-text">
          {{ description }}
        </p>
      </div>

      <section v-for="group in FIELD_GROUPS" :key="group.id" class="group">
        <button
          type="button"
          class="group-head"
          :aria-expanded="open[group.id]"
          @click="open[group.id] = !open[group.id]"
        >
          <span class="group-title">{{ t.groups[group.id] }}</span>
          <span v-if="changedCount(group) > 0" class="group-count">{{ changedCount(group) }}</span>
          <svg class="chevron" :class="{ open: open[group.id] }" width="12" height="12" viewBox="0 0 12 12" aria-hidden="true">
            <path d="M3 4.5L6 7.5L9 4.5" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
        </button>

        <div v-show="open[group.id]" class="group-body">
          <fieldset v-for="field in group.fields" :key="fieldId(field)" class="field" :disabled="inactive(field)">
            <div class="field-head">
              <span v-if="field.kind === 'file'" class="field-name">{{ t.filePath }}</span>
              <code v-else class="field-name">{{ field.key }}</code>
              <span v-if="changed(field)" class="field-dot" :title="t.changedFrom(defaultText(field))" />
              <NumberInput
                v-if="field.kind === 'number'"
                class="field-inline"
                :label="field.key"
                :disabled="inactive(field)"
                :model-value="options[field.key]"
                @update:model-value="update(field.key, $event)"
              />
              <ToggleSwitch
                v-else-if="field.kind === 'switch'"
                class="field-inline"
                :label="field.key"
                :model-value="options[field.key]"
                @update:model-value="update(field.key, $event)"
              />
            </div>
            <p class="field-text">
              {{ t.fields[fieldId(field)] }}
            </p>
            <SegmentedControl
              v-if="field.kind === 'unit'"
              :choices="field.choices"
              :label="field.key"
              :disabled-reason="field.target ? targetReason : undefined"
              :model-value="options[field.key]"
              @update:model-value="update(field.key, $event)"
            />
            <TagInput
              v-else-if="field.kind === 'list'"
              :label="field.key"
              :patterns="isPatternList(field.key)"
              :model-value="options[field.key]"
              @update:model-value="update(field.key, $event)"
            />
            <input
              v-else-if="field.kind === 'text'"
              class="text"
              spellcheck="false"
              :aria-label="field.key"
              :value="options[field.key]"
              @input="update(field.key, ($event.target as HTMLInputElement).value)"
            >
            <input
              v-else-if="field.kind === 'file'"
              v-model="file"
              class="text"
              spellcheck="false"
              :aria-label="t.filePath"
            >
          </fieldset>
        </div>
      </section>
    </div>

    <footer class="options-foot">
      <button type="button" class="reset" @click="emit('reset')">
        <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true">
          <path d="M2.5 7a4.5 4.5 0 1 0 1.32-3.18M2.5 2.5v2.5H5" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
        {{ t.resetOptions }}
      </button>
    </footer>
  </aside>
</template>

<style scoped>
.options {
  display: flex;
  flex-direction: column;
  min-height: 0;
  overflow: hidden;
  border: 1px solid var(--line);
  border-radius: 16px;
  background: var(--surface);
  box-shadow: var(--shadow-card);
}

.options-scroll {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding: 16px 16px 4px;
  scrollbar-width: thin;
}

.example {
  padding-bottom: 16px;
  border-bottom: 1px solid var(--line-soft);
}

.example-label {
  display: block;
  margin-bottom: 8px;
  font-family: var(--mono);
  font-size: 12px;
  font-weight: 500;
  color: var(--accent);
}

.select {
  position: relative;
}

.select select {
  width: 100%;
  height: 38px;
  padding: 0 34px 0 12px;
  border: 1px solid var(--line);
  border-radius: 10px;
  background: var(--surface);
  font-size: 14px;
  font-weight: 550;
  appearance: none;
  cursor: pointer;
  transition:
    border-color 0.15s,
    box-shadow 0.15s;
}

.select select:hover {
  border-color: var(--line-strong);
}

.select select:focus {
  outline: none;
  border-color: var(--accent);
  box-shadow: 0 0 0 3px var(--accent-soft);
}

.select-icon {
  position: absolute;
  top: 50%;
  right: 12px;
  color: var(--muted);
  transform: translateY(-50%);
  pointer-events: none;
}

.example-text {
  margin-top: 10px;
  font-size: 12.5px;
  line-height: 1.55;
  color: var(--muted);
}

.group {
  border-bottom: 1px solid var(--line-soft);
}

.group:last-child {
  border-bottom: 0;
}

.group-head {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  height: 46px;
  text-align: left;
}

.group-title {
  font-size: 13px;
  font-weight: 600;
}

.group-count {
  display: grid;
  place-items: center;
  min-width: 18px;
  height: 18px;
  padding: 0 5px;
  border-radius: 999px;
  background: var(--accent-soft);
  box-shadow: inset 0 0 0 1px var(--accent-ring);
  font-family: var(--mono);
  font-size: 11px;
  color: var(--accent);
}

.chevron {
  margin-left: auto;
  color: var(--faint);
  transform: rotate(-90deg);
  transition: transform 0.18s;
}

.chevron.open {
  transform: none;
}

.group-body {
  padding-bottom: 14px;
}

.field {
  min-width: 0;
}

.field + .field {
  margin-top: 16px;
}

.field:disabled {
  opacity: 0.45;
}

.field-head {
  display: flex;
  align-items: center;
  gap: 8px;
  min-height: 30px;
}

.field-name {
  font-family: var(--mono);
  font-size: 12.5px;
  font-weight: 500;
  font-variant-ligatures: none;
  color: var(--ink);
}

span.field-name {
  font-family: var(--sans);
  font-size: 13px;
}

.field-dot {
  flex: none;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--accent);
  box-shadow: 0 0 0 3px var(--accent-soft);
}

.field-inline {
  margin-left: auto;
}

.field-text {
  margin: 2px 0 8px;
  font-size: 12px;
  line-height: 1.5;
  color: var(--muted);
}

.field :deep(.segmented) {
  display: flex;
  flex-wrap: nowrap;
  width: 100%;
}

.field :deep(.segment) {
  flex: 1;
  min-width: 0;
  padding: 0;
}

.text {
  width: 100%;
  height: 32px;
  padding: 0 10px;
  border: 1px solid var(--line);
  border-radius: 8px;
  background: var(--surface);
  font-family: var(--mono);
  font-size: 12.5px;
  font-variant-ligatures: none;
  transition:
    border-color 0.15s,
    box-shadow 0.15s;
}

.text:hover {
  border-color: var(--line-strong);
}

.text:focus {
  outline: none;
  border-color: var(--accent);
  box-shadow: 0 0 0 3px var(--accent-soft);
}

.options-foot {
  padding: 10px 12px;
  border-top: 1px solid var(--line-soft);
  background: var(--surface-foot);
}

.reset {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 30px;
  padding: 0 10px;
  border-radius: 8px;
  font-size: 12.5px;
  font-weight: 500;
  color: var(--muted);
  transition:
    color 0.15s,
    background-color 0.15s;
}

.reset:hover {
  background: var(--surface-sunken);
  color: var(--ink);
}
</style>
