import { describe, expect, it } from "vitest";
import { artifactSrc, avatarSrc, normalizeKey, weaponSrc } from "./avatars.js";

describe("normalizeKey", () => {
  it("lowercases ASCII", () => {
    expect(normalizeKey("HuTao")).toBe("hutao");
  });

  it("strips non-alphanumeric characters", () => {
    expect(normalizeKey("Hu Tao")).toBe("hutao");
    expect(normalizeKey("Kamisato_Ayaka")).toBe("kamisatoayaka");
    expect(normalizeKey("Staff of Homa")).toBe("staffofhoma");
    expect(normalizeKey("Crimson Witch of Flames")).toBe("crimsonwitchofflames");
  });

  it("preserves digits", () => {
    expect(normalizeKey("4-Star")).toBe("4star");
  });

  it("handles empty/nullish input", () => {
    expect(normalizeKey("")).toBe("");
    expect(normalizeKey(undefined as unknown as string)).toBe("");
  });
});

describe("avatarSrc", () => {
  it("returns URL for a known avatar", () => {
    expect(avatarSrc("hutao")).toBe("/assets/avatar/hutao.png");
  });

  it("normalizes mixed case + whitespace input", () => {
    expect(avatarSrc("Hu Tao")).toBe("/assets/avatar/hutao.png");
  });

  it("falls back to default.png when key unknown", () => {
    expect(avatarSrc("unknown_character")).toBe("/assets/avatar/default.png");
  });

  it("falls back to default.png when input empty", () => {
    expect(avatarSrc("")).toBe("/assets/avatar/default.png");
  });
});

describe("weaponSrc", () => {
  it("returns URL for a known weapon", () => {
    expect(weaponSrc("staffofhoma")).toBe("/assets/weapons/staffofhoma.png");
  });

  it("normalizes mixed case + whitespace input", () => {
    expect(weaponSrc("Staff of Homa")).toBe("/assets/weapons/staffofhoma.png");
  });

  it("returns null for unknown weapon", () => {
    expect(weaponSrc("unknown_weapon")).toBeNull();
  });

  it("returns null for empty input", () => {
    expect(weaponSrc("")).toBeNull();
  });
});

describe("artifactSrc", () => {
  it("returns URL for a known artifact set (flower variant)", () => {
    expect(artifactSrc("crimsonwitchofflames")).toBe(
      "/assets/artifacts/crimsonwitchofflames_flower.png",
    );
  });

  it("normalizes mixed case + whitespace input", () => {
    expect(artifactSrc("Crimson Witch of Flames")).toBe(
      "/assets/artifacts/crimsonwitchofflames_flower.png",
    );
  });

  it("returns null for unknown artifact set", () => {
    expect(artifactSrc("unknown_set")).toBeNull();
  });

  it("returns null for empty input", () => {
    expect(artifactSrc("")).toBeNull();
  });
});
