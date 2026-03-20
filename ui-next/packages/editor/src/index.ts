// Language
export { gcsim } from "./language/gcsim-language";
export { gcsimCompletionSource } from "./language/autocomplete";

// React component
export { Editor } from "./components/editor";
export type { EditorProps } from "./components/editor";

// Diagnostics (for external validation integration)
export { applyDiagnostics, clearDiagnostics } from "./diagnostics/diagnostics";
export type { GcsimError } from "./diagnostics/diagnostics";

// Theme
export { gcsimDarkTheme, gcsimHighlightStyle } from "./theme/dark-theme";
