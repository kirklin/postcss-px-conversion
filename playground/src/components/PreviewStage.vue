<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, useTemplateRef } from "vue";
import PreviewFrame from "~/components/PreviewFrame.vue";
import SegmentedControl from "~/components/SegmentedControl.vue";
import ToggleSwitch from "~/components/ToggleSwitch.vue";
import { t } from "~/lib/i18n";

defineProps<{
  html: string;
  before: string;
  after: string;
  sourceUnit: string;
  targetUnit: string;
  designWidth: number;
  notice?: string;
}>();

const WIDTHS = [320, 375, 414, 768] as const;
const HEIGHT = 720;
const GAP = 28;
// Room for the label above each frame and the width below it
const LABELS = 64;

const width = ref<number>(414);
const compare = ref(true);
const area = useTemplateRef<HTMLDivElement>("area");
const room = ref({ width: 0, height: 0 });

let observer: ResizeObserver | undefined;

onMounted(() => {
  observer = new ResizeObserver(([entry]) => {
    room.value = { width: entry.contentRect.width, height: entry.contentRect.height };
  });
  observer.observe(area.value!);
});

onBeforeUnmount(() => {
  observer?.disconnect();
});

const scale = computed(() => {
  const count = compare.value ? 2 : 1;
  const across = (room.value.width - GAP * (count - 1)) / (count * width.value);
  const down = (room.value.height - LABELS) / HEIGHT;
  return Math.max(0.2, Math.min(1, across, down));
});

const noticeBox = computed(() => ({
  width: `${width.value * scale.value}px`,
  height: `${HEIGHT * scale.value}px`,
}));

const scaleText = computed(() => scale.value < 1 ? ` · ${Math.round(scale.value * 100)}%` : "");
</script>

<template>
  <div class="stage">
    <div class="stage-bar">
      <SegmentedControl v-model="width" :choices="WIDTHS" :label="t.screen" />
      <span class="stage-note">{{ t.design(designWidth) }}</span>
      <label class="compare">
        <ToggleSwitch v-model="compare" :label="t.compare" />
        <span>{{ t.compare }}</span>
      </label>
    </div>

    <div ref="area" class="frames">
      <figure v-if="compare" class="frame">
        <figcaption class="frame-label">
          {{ t.before }} <code>{{ sourceUnit }}</code>
        </figcaption>
        <PreviewFrame :html="html" :css="before" :width="width" :height="HEIGHT" :scale="scale" :title="t.before" />
        <p class="frame-size">
          {{ width }}px{{ scaleText }}
        </p>
      </figure>

      <figure class="frame">
        <figcaption class="frame-label after">
          {{ t.after }} <code>{{ targetUnit }}</code>
        </figcaption>
        <div v-if="notice" class="notice" :style="noticeBox">
          <p>{{ notice }}</p>
        </div>
        <PreviewFrame v-else :html="html" :css="after" :width="width" :height="HEIGHT" :scale="scale" :title="t.after" />
        <p class="frame-size">
          {{ width }}px{{ scaleText }}
        </p>
      </figure>
    </div>
  </div>
</template>

<style scoped>
.stage {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: var(--stage);
}

.stage::before {
  content: "";
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(var(--stage-grid) 1px, transparent 1px),
    linear-gradient(90deg, var(--stage-grid) 1px, transparent 1px);
  background-size: 32px 32px;
  mask-image: radial-gradient(ellipse at center, #000 25%, transparent 80%);
  pointer-events: none;
}

.stage-bar {
  position: relative;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px 14px;
  padding: 14px 16px 10px;
}

.stage-bar :deep(.segmented) {
  background: var(--stage-control);
  backdrop-filter: blur(6px);
}

.stage-note {
  font-family: var(--mono);
  font-size: 12px;
  color: var(--ink-2);
}

.compare {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  margin-left: auto;
  font-size: 12.5px;
  font-weight: 500;
  color: var(--ink-2);
  cursor: pointer;
}

.frames {
  position: relative;
  display: flex;
  flex: 1;
  align-items: flex-start;
  justify-content: center;
  gap: 28px;
  min-height: 0;
  padding: 6px 16px 16px;
}

.frame {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  min-width: 0;
}

.frame-label {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 26px;
  padding: 0 10px;
  border: 1px solid var(--line);
  border-radius: 999px;
  background: var(--surface);
  font-size: 12px;
  font-weight: 600;
  white-space: nowrap;
}

.frame-label code {
  font-family: var(--mono);
  font-weight: 500;
  color: var(--muted);
}

.frame-label.after {
  border-color: var(--accent-ring);
  background: var(--accent-soft-solid);
  color: var(--accent);
}

.frame-label.after code {
  color: var(--accent);
}

.frame-size {
  font-family: var(--mono);
  font-size: 12px;
  color: var(--ink-2);
}

.notice {
  display: grid;
  flex: none;
  place-items: center;
  padding: 16px;
  overflow: hidden;
  border: 1px dashed var(--line-strong);
  border-radius: 22px;
  background: var(--surface);
  text-align: center;
}

.notice p {
  max-width: 260px;
  font-size: 13px;
  line-height: 1.6;
  color: var(--muted);
}
</style>
