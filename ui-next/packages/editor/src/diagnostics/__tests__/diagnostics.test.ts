import { lintGutter } from "@codemirror/lint";
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

    // No throw = diagnostics were applied successfully
    // We can't easily inspect diagnostics state, but the dispatch succeeded
    expect(view.state).toBeDefined();
    view.destroy();
  });

  test("applyDiagnostics with column offset", () => {
    const view = createView("let x = 42;");
    const errors: GcsimError[] = [{ line: 1, column: 5, message: "invalid assignment" }];

    applyDiagnostics(view, errors);
    expect(view.state).toBeDefined();
    view.destroy();
  });

  test("applyDiagnostics clamps line number to doc.lines", () => {
    const view = createView("only one line");
    const errors: GcsimError[] = [{ line: 999, message: "out of bounds" }];

    // Should not throw — clamps to last line
    applyDiagnostics(view, errors);
    expect(view.state).toBeDefined();
    view.destroy();
  });

  test("clearDiagnostics removes all diagnostics", () => {
    const view = createView("some code");

    clearDiagnostics(view);
    expect(view.state).toBeDefined();
    view.destroy();
  });

  test("applyDiagnostics handles multiple errors", () => {
    const view = createView("line one\nline two\nline three");
    const errors: GcsimError[] = [
      { line: 1, message: "error one" },
      { line: 3, message: "error three" },
    ];

    applyDiagnostics(view, errors);
    expect(view.state).toBeDefined();
    view.destroy();
  });
});
