import { HighlightStyle } from "@codemirror/language";
import { EditorView } from "@codemirror/view";
import { tags as t } from "@lezer/highlight";

/**
 * gcsim-dark — CodeMirror theme bound to the gcsim ui-next design system
 * tokens (see `ui-next/docs/design-system.md` § Tokens and
 * `packages/primitives/src/theme.css`).
 *
 * The values below intentionally reference CSS variables rather than fixed
 * hex codes so the editor inherits any future theme adjustments at runtime.
 *
 * Token mapping:
 *
 * Editor chrome
 * - background           → var(--bg-0)             (page surface)
 * - text                 → var(--fg-1)             (secondary fg — easier on eyes than fg-0)
 * - caret                → var(--accent)
 * - selection            → var(--accent-soft)
 * - gutter background    → oklch(1 0 0 / 0.015)    (subtle lift, per spec)
 * - gutter text          → var(--fg-3)
 * - gutter border-right  → var(--line-1)
 * - active line gutter   → var(--bg-1)
 * - matching bracket     → var(--accent-soft) + outline var(--accent)
 * - tooltip background   → var(--bg-2)             (raised surface)
 * - tooltip border       → var(--line-2)
 * - search match         → var(--warn-soft)
 * - fold placeholder     → bg var(--bg-2), text var(--fg-2)
 *
 * Syntax (HighlightStyle)
 * - comments             → var(--fg-3), italic
 * - keywords             → var(--accent)
 * - strings              → var(--el-dendro)        (warm green)
 * - numbers / booleans   → var(--el-geo)           (warm yellow-amber)
 * - identifiers          → var(--el-electro)       (cool purple)
 * - functions / actions  → var(--brand-blue-2)     (distinct from keyword)
 * - class names (chars)  → var(--el-pyro)          (warm)
 * - attribute names      → var(--el-hydro)         (cool)
 * - atoms (elements)     → var(--el-anemo)         (cool teal)
 * - punctuation / sep    → var(--fg-3)
 *
 * Font: `var(--font-mono)` (JetBrains Mono) at 14px default. The font size
 * is also exposed as the `fontSize` prop on `<Editor>` and applied via a
 * Compartment so it can be reconfigured live.
 */
export const gcsimDarkTheme = EditorView.theme(
  {
    "&": {
      backgroundColor: "var(--bg-0)",
      color: "var(--fg-1)",
      fontSize: "14px",
    },
    ".cm-content": {
      caretColor: "var(--accent)",
      fontFamily: "var(--font-mono), 'JetBrains Mono', 'Fira Code', monospace",
    },
    "&.cm-focused .cm-cursor": { borderLeftColor: "var(--accent)" },
    "&.cm-focused .cm-selectionBackground, ::selection, .cm-selectionBackground": {
      backgroundColor: "var(--accent-soft)",
    },
    ".cm-gutters": {
      backgroundColor: "oklch(1 0 0 / 0.015)",
      color: "var(--fg-3)",
      border: "none",
      borderRight: "1px solid var(--line-1)",
    },
    ".cm-activeLineGutter": {
      backgroundColor: "var(--bg-1)",
      color: "var(--fg-1)",
    },
    "&.cm-focused .cm-matchingBracket": {
      backgroundColor: "var(--accent-soft)",
      outline: "1px solid var(--accent)",
    },
    ".cm-tooltip": {
      backgroundColor: "var(--bg-2)",
      border: "1px solid var(--line-2)",
      color: "var(--fg-1)",
    },
    ".cm-tooltip-autocomplete": {
      "& > ul > li": { color: "var(--fg-1)" },
      "& > ul > li[aria-selected]": {
        backgroundColor: "var(--accent-soft)",
        color: "var(--fg-0)",
      },
    },
    ".cm-searchMatch": { backgroundColor: "var(--warn-soft)" },
    ".cm-searchMatch.cm-searchMatch-selected": {
      backgroundColor: "var(--warn-soft)",
      outline: "1px solid var(--warn, oklch(0.82 0.14 75))",
    },
    ".cm-foldPlaceholder": {
      backgroundColor: "var(--bg-2)",
      color: "var(--fg-2)",
      border: "1px solid var(--line-2)",
    },
  },
  { dark: true },
);

export const gcsimHighlightStyle = HighlightStyle.define([
  { tag: t.keyword, color: "var(--accent)" },
  {
    tag: [t.lineComment, t.blockComment],
    color: "var(--fg-3)",
    fontStyle: "italic",
  },
  { tag: t.string, color: "var(--el-dendro)" },
  { tag: t.number, color: "var(--el-geo)" },
  { tag: t.bool, color: "var(--el-geo)" },
  { tag: t.operator, color: "var(--fg-2)" },
  { tag: t.variableName, color: "var(--el-electro)" },
  { tag: t.function(t.variableName), color: "var(--brand-blue-2)" },
  { tag: t.className, color: "var(--el-pyro)" },
  { tag: t.attributeName, color: "var(--el-hydro)" },
  { tag: t.atom, color: "var(--el-anemo)" },
  { tag: [t.paren, t.brace, t.squareBracket], color: "var(--fg-3)" },
  { tag: t.separator, color: "var(--fg-3)" },
  { tag: t.derefOperator, color: "var(--fg-3)" },
  { tag: t.punctuation, color: "var(--fg-3)" },
]);
