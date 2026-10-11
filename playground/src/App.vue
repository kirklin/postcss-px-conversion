<script setup lang="ts">
import type { Ref } from "vue";
import type { Conversion } from "~/lib/convert";
import type { LinkProblem, PlaygroundState } from "~/lib/share";
import { computed, reactive, ref, shallowRef, toRaw, watch } from "vue";
import AppHeader from "~/components/AppHeader.vue";
import CodeEditor from "~/components/CodeEditor.vue";
import OptionsPanel from "~/components/OptionsPanel.vue";
import PaneCard from "~/components/PaneCard.vue";
import PreviewStage from "~/components/PreviewStage.vue";
import SegmentedControl from "~/components/SegmentedControl.vue";
import { convert } from "~/lib/convert";
import { exampleById } from "~/lib/examples";
import { t } from "~/lib/i18n";
import { configSnippet, toPluginOptions, UNIT_CHOICES, unsupportedTarget } from "~/lib/options";
import { encodeState, SHARE_PREFIX, stateFromExample } from "~/lib/share";

const props = defineProps<{ initial: PlaygroundState; linkProblem?: LinkProblem }>();

const state = reactive<PlaygroundState>(structuredClone(props.initial));
const inputTab = ref<"css" | "html">("css");
const outputTab = ref<"css" | "preview" | "config">("css");
const copied = ref(false);
const shared = ref(false);

type Outcome = { conversion: Conversion; error?: undefined } | { conversion?: undefined; error: string };

const outcome = computed((): Outcome => {
  try {
    return { conversion: convert(state.css, toPluginOptions(state.options), state.file) };
  } catch (error) {
    return { error: error instanceof Error ? error.message : String(error) };
  }
});

// While the input has an error, the last output that worked stays on screen, dimmed
const shown = shallowRef<Conversion>(outcome.value.conversion ?? { css: "", converted: [], warnings: [] });
watch(outcome, (value) => {
  if (value.conversion) {
    shown.value = value.conversion;
  }
});

const config = computed(() => configSnippet(state.options));
const fileName = computed(() => state.file.split("/").pop() || state.file);
const inputTabs = computed(() => [
  { id: "css" as const, label: fileName.value },
  { id: "html" as const, label: "index.html" },
]);
const outputTabs = computed(() => [
  { id: "css" as const, label: "output.css" },
  { id: "preview" as const, label: t.value.preview },
  { id: "config" as const, label: "postcss.config.mjs", short: "config" },
]);

const rpxNotice = computed(() => {
  const { viewportUnit, fontViewportUnit, enableLandscape, landscapeUnit } = state.options;
  const units = [viewportUnit, fontViewportUnit, ...(enableLandscape ? [landscapeUnit] : [])];
  return units.includes("rpx") ? t.value.rpxNotice : undefined;
});

const status = computed(() => {
  if (outcome.value.error !== undefined) {
    return { kind: "error", text: t.value.failed };
  }
  const { converted, warnings } = shown.value;
  const text = t.value.converted(converted.length);
  return warnings.length > 0
    ? { kind: "warning", text: `${text} · ${t.value.warnings(warnings.length)}` }
    : { kind: converted.length > 0 ? "ok" : "idle", text };
});

function targetReason(choice: string): string | undefined {
  const reason = unsupportedTarget(state.options.unitType, choice);
  if (reason === "same") {
    return t.value.sameUnit;
  }
  if (reason === "px") {
    return t.value.needsRem;
  }
  return reason === "rem" ? t.value.needsPx : undefined;
}

function flash(flag: Ref<boolean>) {
  flag.value = true;
  setTimeout(() => {
    flag.value = false;
  }, 1600);
}

function selectExample(id: string) {
  Object.assign(state, stateFromExample(exampleById(id)));
}

function resetOptions() {
  const example = stateFromExample(exampleById(state.example));
  state.options = example.options;
  state.file = example.file;
}

function resetCode() {
  const example = exampleById(state.example);
  state.css = example.css;
  state.html = example.html;
}

// The address always holds the current code, so it can be shared or bookmarked
let pending: ReturnType<typeof setTimeout> | undefined;

async function writeAddress() {
  history.replaceState(null, "", `${SHARE_PREFIX}${await encodeState(toRaw(state))}`);
}

watch(state, () => {
  clearTimeout(pending);
  pending = setTimeout(writeAddress, 400);
}, { deep: true });

async function share() {
  clearTimeout(pending);
  await writeAddress();
  await navigator.clipboard.writeText(location.href);
  flash(shared);
}

async function copyOutput() {
  await navigator.clipboard.writeText(outputTab.value === "config" ? config.value : shown.value.css);
  flash(copied);
}
</script>

<template>
  <div class="app">
    <AppHeader :shared="shared" @share="share" />

    <p v-if="linkProblem" class="load-error" role="alert">
      {{ t.loadError(t.linkProblem(linkProblem)) }}
    </p>

    <main class="workspace">
      <OptionsPanel
        v-model:options="state.options"
        v-model:file="state.file"
        class="workspace-options"
        :example="state.example"
        @select-example="selectExample"
        @reset="resetOptions"
      />

      <PaneCard v-model:tab="inputTab" class="workspace-input" :label="t.input" :tabs="inputTabs">
        <template #actions>
          <button type="button" class="action" @click="resetCode">
            {{ t.resetCode }}
          </button>
        </template>
        <CodeEditor v-show="inputTab === 'css'" v-model="state.css" language="css" :label="t.input" />
        <CodeEditor v-show="inputTab === 'html'" v-model="state.html" language="html" :label="t.html" />
        <template #footer>
          <span class="foot-path">{{ state.file }}</span>
          <span class="foot-units">{{ state.options.unitType }} → {{ state.options.viewportUnit }}</span>
        </template>
      </PaneCard>

      <PaneCard v-model:tab="outputTab" class="workspace-output" :label="t.output" :tabs="outputTabs">
        <template #actions>
          <button type="button" class="action" :aria-label="copied ? t.copied : t.copy" @click="copyOutput">
            <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <path v-if="copied" d="M3.5 8.5l3 3 6-7" />
              <template v-else>
                <rect x="5.5" y="5.5" width="8" height="8" rx="2" />
                <path d="M10.5 5.5V4a1.5 1.5 0 0 0-1.5-1.5H4A1.5 1.5 0 0 0 2.5 4v5A1.5 1.5 0 0 0 4 10.5h1.5" />
              </template>
            </svg>
            <span class="action-text">{{ copied ? t.copied : t.copy }}</span>
          </button>
        </template>

        <div v-show="outputTab === 'css'" class="output" :class="{ stale: outcome.error !== undefined }">
          <CodeEditor :model-value="shown.css" language="css" readonly :label="t.output" :converted="shown.converted" />
        </div>
        <PreviewStage
          v-if="outputTab === 'preview'"
          :html="state.html"
          :before="state.css"
          :after="shown.css"
          :source-unit="state.options.unitType"
          :target-unit="state.options.viewportUnit"
          :design-width="shown.fileWidth ?? state.options.viewportWidth"
          :notice="rpxNotice"
        />
        <CodeEditor v-show="outputTab === 'config'" :model-value="config" language="javascript" readonly :label="t.config" />

        <div v-if="outcome.error !== undefined" class="banner error" role="alert">
          <strong>{{ t.failed }}</strong>
          <code>{{ outcome.error }}</code>
        </div>
        <div v-else-if="shown.warnings.length > 0 && outputTab === 'css'" class="banner warning" role="status">
          <strong>{{ t.warnings(shown.warnings.length) }}</strong>
          <code v-for="warning in shown.warnings" :key="warning">{{ warning }}</code>
        </div>

        <template #footer>
          <span class="status" :class="status.kind">{{ status.text }}</span>
          <SegmentedControl
            v-model="state.options.viewportUnit"
            :choices="UNIT_CHOICES"
            :label="t.targetUnit"
            :disabled-reason="targetReason"
          />
        </template>
      </PaneCard>
    </main>
  </div>
</template>

<style scoped>
.app {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.load-error {
  margin: 0 14px 12px;
  padding: 10px 14px;
  border: 1px solid var(--danger-ring);
  border-radius: 12px;
  background: var(--danger-soft);
  font-size: 13px;
  color: var(--danger);
}

.workspace {
  display: grid;
  flex: 1;
  grid-template-columns: 304px minmax(0, 1fr) minmax(0, 1fr);
  gap: 14px;
  min-height: 0;
  padding: 0 14px 14px;
}

.action {
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

.action:hover {
  background: var(--hover);
  color: var(--ink);
}

.foot-path {
  overflow: hidden;
  min-width: 0;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.foot-units {
  padding-right: 8px;
  color: var(--ink-2);
}

.output {
  height: 100%;
  transition: opacity 0.15s;
}

.output.stale {
  opacity: 0.4;
}

.banner {
  position: absolute;
  right: 12px;
  bottom: 12px;
  left: 12px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 10px 14px;
  border: 1px solid;
  border-radius: 12px;
  font-size: 12.5px;
  box-shadow: var(--shadow-pop);
}

.banner code {
  font-family: var(--mono);
  font-size: 12px;
  font-variant-ligatures: none;
  white-space: pre-wrap;
  word-break: break-word;
}

.banner.error {
  border-color: var(--danger-ring);
  background: var(--danger-surface);
  color: var(--danger);
}

.banner.warning {
  border-color: var(--warning-ring);
  background: var(--warning-surface);
  color: var(--warning);
}

.status {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-family: var(--sans);
  font-size: 12.5px;
  color: var(--ink-2);
}

.status::before {
  content: "";
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--faint);
}

.status.ok::before {
  background: var(--accent-strong);
  box-shadow: 0 0 0 3px var(--accent-soft);
}

.status.warning::before {
  background: var(--warning);
  box-shadow: 0 0 0 3px var(--warning-soft);
}

.status.error {
  color: var(--danger);
}

.status.error::before {
  background: var(--danger);
  box-shadow: 0 0 0 3px var(--danger-soft);
}

/* Below three columns the page scrolls, so the output pane keeps room for the preview */
@media (max-width: 1279px) {
  .app {
    height: auto;
    min-height: 100%;
  }

  .workspace {
    grid-template-columns: 288px minmax(0, 1fr);
    align-items: start;
  }

  .workspace-options {
    position: sticky;
    top: 14px;
    grid-row: 1 / 3;
    max-height: calc(100vh - 28px);
  }

  .workspace-input {
    height: 460px;
  }

  .workspace-output {
    height: 700px;
  }
}

@media (max-width: 860px) {
  .workspace {
    display: flex;
    flex-direction: column;
    align-items: stretch;
  }

  .workspace-input {
    flex: none;
    height: 440px;
  }

  .workspace-output {
    flex: none;
    height: 640px;
  }

  .workspace-options {
    position: static;
    order: 3;
    max-height: none;
  }
}

@media (max-width: 480px) {
  .action-text {
    display: none;
  }
}
</style>
