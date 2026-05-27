import { describe, expect, it } from "vitest";
import { actionColor, characterColor, elementColor, reactionColor } from "./colors.js";

describe("characterColor", () => {
  it("returns different colors for different indices", () => {
    const c0 = characterColor(0);
    const c1 = characterColor(1);
    expect(c0).not.toBe(c1);
  });

  it("wraps around after palette length", () => {
    expect(characterColor(8)).toBe(characterColor(0));
  });

  it("returns a CSS var reference", () => {
    expect(characterColor(0)).toMatch(/^var\(--el-[a-z]+\)$/);
  });
});

describe("elementColor", () => {
  it("returns pyro token for pyro", () => {
    expect(elementColor("pyro")).toBe("var(--el-pyro)");
  });

  it("is case-insensitive", () => {
    expect(elementColor("Hydro")).toBe("var(--el-hydro)");
  });

  it("returns physical fallback for unknown element", () => {
    expect(elementColor("unknown")).toBe("var(--el-physical)");
  });
});

describe("actionColor", () => {
  it("returns pyro token for burst", () => {
    expect(actionColor("burst")).toBe("var(--el-pyro)");
  });

  it("returns geo token for skill", () => {
    expect(actionColor("skill")).toBe("var(--el-geo)");
  });

  it("returns physical fallback for unknown action", () => {
    expect(actionColor("unknown")).toBe("var(--el-physical)");
  });
});

describe("reactionColor", () => {
  it("returns pyro token for vaporize", () => {
    expect(reactionColor("vaporize")).toBe("var(--el-pyro)");
  });

  it("returns hydro token for freeze", () => {
    expect(reactionColor("freeze")).toBe("var(--el-hydro)");
  });

  it("returns physical fallback for unknown reaction", () => {
    expect(reactionColor("unknown")).toBe("var(--el-physical)");
  });
});
