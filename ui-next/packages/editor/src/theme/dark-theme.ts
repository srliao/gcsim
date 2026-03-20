import { EditorView } from "@codemirror/view";
import { HighlightStyle } from "@codemirror/language";
import { tags as t } from "@lezer/highlight";

export const gcsimDarkTheme = EditorView.theme(
  {
    "&": {
      backgroundColor: "#1e1e2e",
      color: "#cdd6f4",
      fontSize: "14px",
    },
    ".cm-content": {
      caretColor: "#f5e0dc",
      fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
    },
    "&.cm-focused .cm-cursor": { borderLeftColor: "#f5e0dc" },
    "&.cm-focused .cm-selectionBackground, ::selection": {
      backgroundColor: "#45475a",
    },
    ".cm-gutters": {
      backgroundColor: "#181825",
      color: "#6c7086",
      border: "none",
    },
    ".cm-activeLineGutter": {
      backgroundColor: "#1e1e2e",
      color: "#cdd6f4",
    },
    "&.cm-focused .cm-matchingBracket": {
      backgroundColor: "#45475a",
      outline: "1px solid #89b4fa",
    },
    ".cm-tooltip": {
      backgroundColor: "#1e1e2e",
      border: "1px solid #45475a",
    },
    ".cm-tooltip-autocomplete": {
      "& > ul > li": { color: "#cdd6f4" },
      "& > ul > li[aria-selected]": {
        backgroundColor: "#45475a",
        color: "#cdd6f4",
      },
    },
    ".cm-searchMatch": { backgroundColor: "#f9e2af40" },
    ".cm-searchMatch.cm-searchMatch-selected": {
      backgroundColor: "#f9e2af80",
    },
    ".cm-foldPlaceholder": {
      backgroundColor: "#45475a",
      color: "#cdd6f4",
      border: "none",
    },
  },
  { dark: true },
);

export const gcsimHighlightStyle = HighlightStyle.define([
  { tag: t.keyword, color: "#cba6f7" }, // purple
  {
    tag: [t.lineComment, t.blockComment],
    color: "#6c7086",
    fontStyle: "italic",
  },
  { tag: t.string, color: "#a6e3a1" }, // green
  { tag: t.number, color: "#fab387" }, // peach
  { tag: t.bool, color: "#fab387" }, // peach
  { tag: t.operator, color: "#89dceb" }, // sky
  { tag: t.variableName, color: "#cdd6f4" }, // text
  { tag: t.function(t.variableName), color: "#89b4fa" }, // blue (actions)
  { tag: t.className, color: "#f9e2af" }, // yellow (characters)
  { tag: t.attributeName, color: "#94e2d5" }, // teal (stats)
  { tag: t.atom, color: "#f5c2e7" }, // pink (elements)
  { tag: [t.paren, t.brace, t.squareBracket], color: "#9399b2" },
  { tag: t.separator, color: "#9399b2" },
  { tag: t.derefOperator, color: "#9399b2" },
  { tag: t.punctuation, color: "#9399b2" },
]);
