import { type Diagnostic, setDiagnostics } from "@codemirror/lint";
import type { EditorView } from "@codemirror/view";

export interface GcsimError {
  line: number; // 1-based line number
  column?: number; // 1-based column (optional)
  message: string;
}

/**
 * Convert gcsim validation errors to CM6 diagnostics and apply them.
 * Errors come from executor.validate() (WASM Go parser), not from the Lezer grammar.
 */
export function applyDiagnostics(view: EditorView, errors: GcsimError[]): void {
  const diagnostics: Diagnostic[] = errors.map((err) => {
    const line = view.state.doc.line(Math.min(err.line, view.state.doc.lines));
    const from = line.from + (err.column ? err.column - 1 : 0);
    const to = line.to;

    return {
      from,
      to,
      severity: "error",
      message: err.message,
      source: "gcsim",
    };
  });

  view.dispatch(setDiagnostics(view.state, diagnostics));
}

export function clearDiagnostics(view: EditorView): void {
  view.dispatch(setDiagnostics(view.state, []));
}
