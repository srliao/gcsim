import { CompletionContext } from "@codemirror/autocomplete";
import { EditorState } from "@codemirror/state";
import { describe, expect, test } from "vitest";
import { gcsimCompletionSource } from "../autocomplete";
import { gcsim } from "../gcsim-language";

function getCompletions(doc: string, pos?: number) {
  const state = EditorState.create({
    doc,
    extensions: [gcsim()],
  });
  const context = new CompletionContext(state, pos ?? doc.length, true);
  return gcsimCompletionSource(context);
}

describe("gcsim autocomplete", () => {
  test("provides completions for partial keyword", () => {
    const result = getCompletions("whi");
    expect(result).not.toBeNull();
    const labels = result?.options.map((o) => o.label);
    expect(labels).toContain("while");
  });

  test("provides character completions after 'add char '", () => {
    const result = getCompletions("add char ");
    expect(result).not.toBeNull();
    const types = new Set(result?.options.map((o) => o.type));
    expect(types).toEqual(new Set(["class"]));
    const labels = result?.options.map((o) => o.label);
    expect(labels).toContain("bennett");
    expect(labels).toContain("hutao");
  });

  test("provides action completions after character.dot", () => {
    const result = getCompletions("bennett.");
    expect(result).not.toBeNull();
    const labels = result?.options.map((o) => o.label);
    expect(labels).toContain("skill");
    expect(labels).toContain("burst");
    expect(labels).toContain("attack");
  });

  test("provides stat completions after 'stats' keyword", () => {
    const result = getCompletions("stats hp");
    expect(result).not.toBeNull();
    const labels = result?.options.map((o) => o.label);
    expect(labels).toContain("hp%");
    expect(labels).toContain("hp");
    expect(labels).toContain("atk%");
  });

  test("provides character completions after 'active '", () => {
    const result = getCompletions("active ");
    expect(result).not.toBeNull();
    const labels = result?.options.map((o) => o.label);
    expect(labels).toContain("bennett");
  });

  test("returns null for empty non-explicit context", () => {
    const state = EditorState.create({
      doc: " ",
      extensions: [gcsim()],
    });
    // non-explicit (typing, not ctrl+space)
    const context = new CompletionContext(state, 1, false);
    const result = gcsimCompletionSource(context);
    expect(result).toBeNull();
  });

  test("default completions include all categories", () => {
    const result = getCompletions("b");
    expect(result).not.toBeNull();
    const labels = result?.options.map((o) => o.label);
    // keywords
    expect(labels).toContain("break");
    // characters
    expect(labels).toContain("bennett");
    // actions
    expect(labels).toContain("burst");
    // stats
    expect(labels).toContain("cr");
  });
});
