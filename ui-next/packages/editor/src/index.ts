// Language

export type {
  EditorParseStatus,
  EditorProps,
  EditorTab,
} from "./components/editor";
// React component
export { Editor } from "./components/editor";
export type { GcsimError } from "./diagnostics/diagnostics";
// Diagnostics (for external validation integration)
export { applyDiagnostics, clearDiagnostics } from "./diagnostics/diagnostics";
export { gcsimCompletionSource } from "./language/autocomplete";
export { gcsim } from "./language/gcsim-language";
// Token name lists (used by the ⌘K palette and other consumers)
export {
  ACTION_NAMES,
  CHARACTER_NAMES,
  ELEMENT_NAMES,
  STAT_NAMES,
} from "./language/tokens";

// Theme
export { gcsimDarkTheme, gcsimHighlightStyle } from "./theme/dark-theme";
