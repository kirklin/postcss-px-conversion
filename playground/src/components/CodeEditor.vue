<script setup lang="ts">
import type { Extension } from "@codemirror/state";
import type { ConvertedValue } from "~/lib/convert";
import { defaultKeymap, history, historyKeymap, indentWithTab } from "@codemirror/commands";
import { css } from "@codemirror/lang-css";
import { html } from "@codemirror/lang-html";
import { javascript } from "@codemirror/lang-javascript";
import { bracketMatching, indentOnInput, syntaxHighlighting } from "@codemirror/language";
import { EditorState } from "@codemirror/state";
import { drawSelection, EditorView, highlightActiveLine, highlightActiveLineGutter, keymap, lineNumbers } from "@codemirror/view";
import { onBeforeUnmount, onMounted, shallowRef, useTemplateRef, watch } from "vue";
import { convertedValues, editorHighlight, editorTheme, setConverted } from "~/lib/editor";

const props = defineProps<{
  language: "css" | "html" | "javascript";
  label: string;
  readonly?: boolean;
  converted?: ConvertedValue[];
}>();

const model = defineModel<string>({ required: true });
const host = useTemplateRef<HTMLDivElement>("host");
const view = shallowRef<EditorView>();

const LANGUAGES = { css, html, javascript };

onMounted(() => {
  const extensions: Extension[] = [
    lineNumbers(),
    drawSelection(),
    LANGUAGES[props.language](),
    syntaxHighlighting(editorHighlight),
    editorTheme,
    convertedValues,
    EditorView.contentAttributes.of({ "aria-label": props.label }),
    EditorView.updateListener.of((update) => {
      if (update.docChanged) {
        model.value = update.state.doc.toString();
      }
    }),
  ];
  if (props.readonly) {
    extensions.push(EditorState.readOnly.of(true), EditorView.editable.of(false));
  } else {
    extensions.push(
      history(),
      indentOnInput(),
      bracketMatching(),
      highlightActiveLine(),
      highlightActiveLineGutter(),
      keymap.of([...defaultKeymap, ...historyKeymap, indentWithTab]),
    );
  }
  view.value = new EditorView({
    parent: host.value!,
    state: EditorState.create({ doc: model.value, extensions }),
  });
  view.value.dispatch({ effects: setConverted.of(props.converted ?? []) });
});

// A new document and its converted values arrive together, so both go into one transaction
watch(() => [model.value, props.converted] as const, ([doc, converted]) => {
  const current = view.value;
  if (!current) {
    return;
  }
  const changes = doc === current.state.doc.toString()
    ? undefined
    : { from: 0, to: current.state.doc.length, insert: doc };
  current.dispatch({ changes, effects: setConverted.of(converted ?? []) });
});

onBeforeUnmount(() => {
  view.value?.destroy();
});
</script>

<template>
  <div ref="host" class="code-editor" />
</template>

<style scoped>
.code-editor {
  height: 100%;
}
</style>
