import { diagnosticCount, lintGutter } from "@codemirror/lint";
import { EditorState } from "@codemirror/state";
import { EditorView } from "@codemirror/view";
import { describe, expect, test } from "vitest";
import type { GcsimError } from "../diagnostics";
import { applyDiagnostics, clearDiagnostics } from "../diagnostics";

function createView(doc: string): EditorView {
  return new EditorView({
    state: EditorState.create({
      doc,
      extensions: [lintGutter()],
    }),
  });
}

describe("diagnostics", () => {
  test("applyDiagnostics sets error diagnostics on the view", () => {
    const view = createView("line one\nline two\nline three");
    const errors: GcsimError[] = [{ line: 2, message: "unexpected token" }];

    applyDiagnostics(view, errors);

    expect(diagnosticCount(view.state)).toBe(1);
    view.destroy();
  });

  test("applyDiagnostics with column offset", () => {
    const view = createView("let x = 42;");
    const errors: GcsimError[] = [{ line: 1, column: 5, message: "invalid assignment" }];

    applyDiagnostics(view, errors);
    expect(diagnosticCount(view.state)).toBe(1);
    view.destroy();
  });

  test("applyDiagnostics clamps line number to doc.lines", () => {
    const view = createView("only one line");
    const errors: GcsimError[] = [{ line: 999, message: "out of bounds" }];

    // Should not throw — clamps to last line
    applyDiagnostics(view, errors);
    expect(diagnosticCount(view.state)).toBe(1);
    view.destroy();
  });

  test("clearDiagnostics removes all diagnostics", () => {
    const view = createView("some code");
    const errors: GcsimError[] = [{ line: 1, message: "test error" }];

    applyDiagnostics(view, errors);
    expect(diagnosticCount(view.state)).toBe(1);

    clearDiagnostics(view);
    expect(diagnosticCount(view.state)).toBe(0);
    view.destroy();
  });

  test("applyDiagnostics handles multiple errors", () => {
    const view = createView("line one\nline two\nline three");
    const errors: GcsimError[] = [
      { line: 1, message: "error one" },
      { line: 3, message: "error three" },
    ];

    applyDiagnostics(view, errors);
    expect(diagnosticCount(view.state)).toBe(2);
    view.destroy();
  });
});
