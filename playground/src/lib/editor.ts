import type { ConvertedValue } from "./convert";
import { HighlightStyle } from "@codemirror/language";
import { StateEffect, StateField } from "@codemirror/state";
import { Decoration, EditorView, hoverTooltip } from "@codemirror/view";
import { tags } from "@lezer/highlight";

export const editorTheme = EditorView.theme({
  "&": {
    height: "100%",
    color: "var(--ink-2)",
    backgroundColor: "transparent",
    fontSize: "13px",
  },
  "&.cm-focused": { outline: "none" },
  ".cm-scroller": {
    fontFamily: "var(--mono)",
    lineHeight: "1.75",
    fontVariantLigatures: "none",
  },
  ".cm-content": { padding: "14px 0", caretColor: "var(--accent)" },
  ".cm-line": { padding: "0 20px 0 8px" },
  ".cm-gutters": {
    backgroundColor: "transparent",
    border: "none",
    color: "var(--faint)",
  },
  ".cm-lineNumbers .cm-gutterElement": { minWidth: "40px", padding: "0 4px 0 16px" },
  ".cm-activeLine": { backgroundColor: "var(--active-line)" },
  ".cm-activeLineGutter": { backgroundColor: "transparent", color: "var(--ink-2)" },
  ".cm-cursor, .cm-dropCursor": { borderLeft: "2px solid var(--accent)" },
  "&.cm-focused > .cm-scroller > .cm-selectionLayer .cm-selectionBackground, .cm-selectionBackground, .cm-content ::selection": {
    backgroundColor: "var(--selection)",
  },
  ".cm-matchingBracket, &.cm-focused .cm-matchingBracket": {
    backgroundColor: "var(--accent-soft)",
    outline: "1px solid var(--accent-ring)",
  },
  ".cm-converted": {
    color: "var(--accent)",
    backgroundColor: "var(--accent-soft)",
    boxShadow: "inset 0 0 0 1px var(--accent-ring)",
    borderRadius: "4px",
  },
  ".cm-converted *": { color: "inherit", fontWeight: "500" },
  ".cm-tooltip": { border: "none", backgroundColor: "transparent" },
  ".cm-converted-tip": {
    padding: "5px 9px",
    borderRadius: "8px",
    backgroundColor: "var(--ink)",
    color: "var(--bg)",
    fontFamily: "var(--mono)",
    fontSize: "12px",
    fontVariantLigatures: "none",
    boxShadow: "var(--shadow-pop)",
  },
});

export const editorHighlight = HighlightStyle.define([
  { tag: tags.comment, color: "var(--faint)", fontStyle: "italic" },
  { tag: [tags.className, tags.tagName, tags.labelName, tags.constant(tags.className)], color: "var(--ink)", fontWeight: "500" },
  { tag: [tags.propertyName, tags.attributeName], color: "var(--ink-2)" },
  { tag: [tags.number, tags.unit, tags.color, tags.bool], color: "var(--ink)", fontWeight: "500" },
  { tag: [tags.string, tags.attributeValue, tags.regexp], color: "var(--code-string)" },
  { tag: [tags.definitionKeyword, tags.keyword, tags.moduleKeyword], color: "var(--ink)", fontWeight: "600" },
  { tag: [tags.atom, tags.operatorKeyword, tags.variableName, tags.modifier], color: "var(--ink-2)" },
  { tag: [tags.punctuation, tags.bracket, tags.separator, tags.angleBracket, tags.operator, tags.derefOperator, tags.definitionOperator], color: "var(--faint)" },
]);

export const setConverted = StateEffect.define<ConvertedValue[]>();

const convertedMark = Decoration.mark({ class: "cm-converted" });

// The converted values of the current document. They are replaced together with the document.
const convertedField = StateField.define<ConvertedValue[]>({
  create: () => [],
  update(values, transaction) {
    for (const effect of transaction.effects) {
      if (effect.is(setConverted)) {
        return effect.value;
      }
    }
    return transaction.docChanged ? [] : values;
  },
  provide: field => EditorView.decorations.from(field, values =>
    Decoration.set(values.map(value => convertedMark.range(value.from, value.to)), true)),
});

const convertedTooltip = hoverTooltip((view, position) => {
  const value = view.state.field(convertedField).find(item => position >= item.from && position <= item.to);
  if (!value) {
    return null;
  }
  return {
    pos: value.from,
    end: value.to,
    above: true,
    create() {
      const dom = document.createElement("div");
      dom.className = "cm-converted-tip";
      dom.textContent = `${value.before} → ${value.after}`;
      return { dom };
    },
  };
});

export const convertedValues = [convertedField, convertedTooltip];
