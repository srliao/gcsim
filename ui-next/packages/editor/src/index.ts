// Language

export type { EditorProps } from "./components/editor";
// React component
export { Editor } from "./components/editor";
export type { GcsimError } from "./diagnostics/diagnostics";
// Diagnostics (for external validation integration)
export { applyDiagnostics, clearDiagnostics } from "./diagnostics/diagnostics";
export { gcsimCompletionSource } from "./language/autocomplete";
export { gcsim } from "./language/gcsim-language";

// Theme
export { gcsimDarkTheme, gcsimHighlightStyle } from "./theme/dark-theme";
