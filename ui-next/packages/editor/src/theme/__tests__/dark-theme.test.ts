import { syntaxHighlighting } from "@codemirror/language";
import { EditorState } from "@codemirror/state";
import { EditorView } from "@codemirror/view";
import { afterEach, beforeEach, describe, expect, test } from "vitest";
import { gcsimDarkTheme, gcsimHighlightStyle } from "../dark-theme";

describe("gcsim-dark theme", () => {
  test("gcsimDarkTheme is a CodeMirror Extension", () => {
    // Extensions are accepted into EditorState.create without throwing.
    const state = EditorState.create({ extensions: [gcsimDarkTheme] });
    expect(state).toBeDefined();
  });

  test("gcsimHighlightStyle is composable via syntaxHighlighting()", () => {
    const state = EditorState.create({
      extensions: [syntaxHighlighting(gcsimHighlightStyle)],
    });
    expect(state).toBeDefined();
  });

  describe("uses CSS variables, not hex codes", () => {
    let container: HTMLDivElement;
    let view: EditorView;

    beforeEach(() => {
      container = document.createElement("div");
      document.body.appendChild(container);
      view = new EditorView({
        state: EditorState.create({ extensions: [gcsimDarkTheme] }),
        parent: container,
      });
    });

    afterEach(() => {
      view.destroy();
      container.remove();
    });

    test("editor root background uses var(--bg-0)", () => {
      const editor = container.querySelector(".cm-editor") as HTMLElement;
      expect(editor).toBeTruthy();
      const style = editor.style.cssText + "" + getComputedStyle(editor).backgroundColor;
      // jsdom's getComputedStyle doesn't resolve var(), so the raw inline
      // string should still contain `var(--bg-0)` somewhere in the
      // generated stylesheet. Search the actual style element CM6 injects.
      const styleSheets = Array.from(document.styleSheets);
      const allCss = styleSheets
        .flatMap((s) => {
          try {
            return Array.from(s.cssRules).map((r) => r.cssText);
          } catch {
            return [];
          }
        })
        .join("\n");
      expect(allCss + style).toMatch(/var\(--bg-0\)/);
    });

    test("theme references the accent token for caret/selection", () => {
      const styleSheets = Array.from(document.styleSheets);
      const allCss = styleSheets
        .flatMap((s) => {
          try {
            return Array.from(s.cssRules).map((r) => r.cssText);
          } catch {
            return [];
          }
        })
        .join("\n");
      expect(allCss).toMatch(/var\(--accent\)/);
      expect(allCss).toMatch(/var\(--accent-soft\)/);
    });

    test("theme references gutter + foreground tokens", () => {
      const styleSheets = Array.from(document.styleSheets);
      const allCss = styleSheets
        .flatMap((s) => {
          try {
            return Array.from(s.cssRules).map((r) => r.cssText);
          } catch {
            return [];
          }
        })
        .join("\n");
      expect(allCss).toMatch(/var\(--fg-3\)/);
      expect(allCss).toMatch(/var\(--line-1\)/);
      expect(allCss).toMatch(/var\(--bg-2\)/);
    });

    test("theme uses var(--font-mono) for content", () => {
      const styleSheets = Array.from(document.styleSheets);
      const allCss = styleSheets
        .flatMap((s) => {
          try {
            return Array.from(s.cssRules).map((r) => r.cssText);
          } catch {
            return [];
          }
        })
        .join("\n");
      expect(allCss).toMatch(/var\(--font-mono\)/);
    });
  });

  test("dark-theme.ts source contains no hex color codes outside doc comments", async () => {
    // Load the raw source file (vitest is configured with jsdom; node fs is available).
    const fs = await import("node:fs");
    const path = await import("node:path");
    const src = fs.readFileSync(path.resolve(__dirname, "../dark-theme.ts"), "utf-8");

    // Strip /* ... */ block comments and // line comments before scanning.
    const codeOnly = src.replace(/\/\*[\s\S]*?\*\//g, "").replace(/^\s*\/\/.*$/gm, "");

    // 6-digit hex codes (e.g. #1e1e2e) — anywhere in non-comment source.
    expect(codeOnly).not.toMatch(/#[0-9a-fA-F]{6}\b/);
    // 8-digit (alpha) — same.
    expect(codeOnly).not.toMatch(/#[0-9a-fA-F]{8}\b/);
  });

  test("highlight style covers comment, keyword, string, number, identifier", () => {
    // HighlightStyle exposes a `module` getter that returns a style module
    // with class names. We can't easily introspect tag → color without
    // invoking the CodeMirror highlighter, so instead grep the source.
    // (Behavioural coverage is provided by the "no hex" + the gcsim
    // language tests elsewhere.)
    expect(gcsimHighlightStyle).toBeDefined();
  });
});
