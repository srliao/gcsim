import { describe, expect, test } from "vitest";
import { EditorState } from "@codemirror/state";
import { syntaxTree } from "@codemirror/language";
import { LRLanguage } from "@codemirror/language";
// Import from generated parser (not the .grammar source)
import { parser } from "../parser";

// Minimal language for testing (no autocomplete/theme needed)
const testLanguage = LRLanguage.define({ name: "gcsim", parser });

function getTokens(doc: string): Array<{ name: string; text: string }> {
  const state = EditorState.create({
    doc,
    extensions: [testLanguage],
  });
  const tree = syntaxTree(state);
  const tokens: Array<{ name: string; text: string }> = [];
  tree.cursor().iterate((node) => {
    if (node.name !== "Program") {
      tokens.push({
        name: node.name,
        text: doc.slice(node.from, node.to),
      });
    }
  });
  return tokens;
}

describe("gcsim grammar tokenizer", () => {
  test("tokenizes numbers", () => {
    const tokens = getTokens("90 1.5 0.75");
    expect(tokens).toEqual([
      { name: "Number", text: "90" },
      { name: "Number", text: "1.5" },
      { name: "Number", text: "0.75" },
    ]);
  });

  test("tokenizes string literals", () => {
    const tokens = getTokens('"hello world"');
    expect(tokens).toEqual([{ name: "StringLiteral", text: '"hello world"' }]);
  });

  test("tokenizes backtick strings", () => {
    const tokens = getTokens("`raw string`");
    expect(tokens).toEqual([{ name: "StringLiteral", text: "`raw string`" }]);
  });

  test("tokenizes line comments", () => {
    const tokens = getTokens("// this is a comment");
    expect(tokens).toEqual([
      { name: "LineComment", text: "// this is a comment" },
    ]);
  });

  test("tokenizes hash comments", () => {
    const tokens = getTokens("# this is a comment");
    expect(tokens).toEqual([
      { name: "HashComment", text: "# this is a comment" },
    ]);
  });

  test("tokenizes block comments", () => {
    const tokens = getTokens("/* block comment */");
    expect(tokens).toEqual([
      { name: "BlockComment", text: "/* block comment */" },
    ]);
  });

  test("tokenizes identifiers", () => {
    const tokens = getTokens("foo bar_baz");
    expect(tokens).toEqual([
      { name: "Identifier", text: "foo" },
      { name: "Identifier", text: "bar_baz" },
    ]);
  });

  test("specializes character names", () => {
    const tokens = getTokens("bennett hutao kazuha");
    expect(tokens).toEqual([
      { name: "CharacterName", text: "bennett" },
      { name: "CharacterName", text: "hutao" },
      { name: "CharacterName", text: "kazuha" },
    ]);
  });

  test("specializes action names", () => {
    const tokens = getTokens("skill burst attack dash swap");
    expect(tokens).toEqual([
      { name: "ActionName", text: "skill" },
      { name: "ActionName", text: "burst" },
      { name: "ActionName", text: "attack" },
      { name: "ActionName", text: "dash" },
      { name: "ActionName", text: "swap" },
    ]);
  });

  test("specializes stat names (including % suffix)", () => {
    const tokens = getTokens("hp% atk def% cr cd em");
    expect(tokens).toEqual([
      { name: "StatName", text: "hp%" },
      { name: "StatName", text: "atk" },
      { name: "StatName", text: "def%" },
      { name: "StatName", text: "cr" },
      { name: "StatName", text: "cd" },
      { name: "StatName", text: "em" },
    ]);
  });

  test("specializes element names", () => {
    const tokens = getTokens("pyro hydro cryo electro");
    expect(tokens).toEqual([
      { name: "ElementName", text: "pyro" },
      { name: "ElementName", text: "hydro" },
      { name: "ElementName", text: "cryo" },
      { name: "ElementName", text: "electro" },
    ]);
  });

  test("tokenizes a realistic config snippet", () => {
    const tokens = getTokens(
      'bennett char lvl=90/90 cons=6;\nbennett add weapon="favoniussword" refine=5 lvl=90/90;'
    );
    const names = tokens.map((t) => t.name);
    // "bennett" should be CharacterName
    expect(names[0]).toBe("CharacterName");
    // "char" should be Identifier (not a specialized token)
    expect(names[1]).toBe("Identifier");
    // Numbers should be present
    expect(names).toContain("Number");
    // String literal should be present
    expect(names).toContain("StringLiteral");
  });

  test("tokenizes hyphenated character names", () => {
    const tokens = getTokens("aether-anemo lumine-geo");
    expect(tokens).toEqual([
      { name: "CharacterName", text: "aether-anemo" },
      { name: "CharacterName", text: "lumine-geo" },
    ]);
  });

  test("stat priority over element (elements also match but stats checked first)", () => {
    // "er" is a stat, not confused with anything else
    const tokens = getTokens("er");
    expect(tokens).toEqual([{ name: "StatName", text: "er" }]);
  });
});
