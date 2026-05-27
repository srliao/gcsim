import { describe, expect, it } from "vitest";
import { ELEMENT_TOKENS, resolveElementColor } from "./element-style.js";

describe("ELEMENT_TOKENS", () => {
  it("includes all eight elements", () => {
    expect(Object.keys(ELEMENT_TOKENS).sort()).toEqual([
      "anemo",
      "cryo",
      "dendro",
      "electro",
      "geo",
      "hydro",
      "physical",
      "pyro",
    ]);
  });

  it("maps each element to its --el-<element> CSS var", () => {
    for (const [element, token] of Object.entries(ELEMENT_TOKENS)) {
      expect(token).toBe(`var(--el-${element})`);
    }
  });
});

describe("resolveElementColor", () => {
  it("resolves known elements to their token", () => {
    expect(resolveElementColor("pyro")).toBe("var(--el-pyro)");
    expect(resolveElementColor("hydro")).toBe("var(--el-hydro)");
    expect(resolveElementColor("physical")).toBe("var(--el-physical)");
  });

  it("is case-insensitive", () => {
    expect(resolveElementColor("Pyro")).toBe("var(--el-pyro)");
    expect(resolveElementColor("ELECTRO")).toBe("var(--el-electro)");
  });

  it("falls back to var(--bg-3) for unknown elements", () => {
    expect(resolveElementColor("quantum")).toBe("var(--bg-3)");
    expect(resolveElementColor("imaginary")).toBe("var(--bg-3)");
  });

  it("falls back to var(--bg-3) for undefined", () => {
    expect(resolveElementColor(undefined)).toBe("var(--bg-3)");
  });

  it("falls back to var(--bg-3) for null", () => {
    expect(resolveElementColor(null)).toBe("var(--bg-3)");
  });

  it("falls back to var(--bg-3) for empty string", () => {
    expect(resolveElementColor("")).toBe("var(--bg-3)");
  });
});
