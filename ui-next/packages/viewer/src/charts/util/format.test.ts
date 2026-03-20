import { describe, expect, it } from "vitest";
import { formatDamage, formatDuration, formatPercent, formatStat } from "./format.js";

describe("formatDamage", () => {
  it("formats millions", () => {
    expect(formatDamage(1_500_000)).toBe("1.5M");
  });

  it("formats thousands", () => {
    expect(formatDamage(50_250)).toBe("50.3K");
  });

  it("formats small numbers as-is", () => {
    expect(formatDamage(999)).toBe("999");
  });
});

describe("formatPercent", () => {
  it("converts decimal to percentage", () => {
    expect(formatPercent(0.653)).toBe("65%");
  });

  it("handles 1.0", () => {
    expect(formatPercent(1)).toBe("100%");
  });
});

describe("formatDuration", () => {
  it("converts bucket index and size to seconds", () => {
    // bucket 3, size 60 frames → 3 * 60 / 60 = 3.0s
    expect(formatDuration(3, 60)).toBe("3.0s");
  });

  it("handles fractional seconds", () => {
    // bucket 5, size 30 frames → 5 * 30 / 60 = 2.5s
    expect(formatDuration(5, 30)).toBe("2.5s");
  });
});

describe("formatStat", () => {
  it("formats mean ± sd", () => {
    const result = formatStat({ mean: 50250, sd: 4200 });
    expect(result).toContain("50,250");
    expect(result).toContain("4,200");
    expect(result).toContain("±");
  });

  it("handles missing values", () => {
    const result = formatStat({});
    expect(result).toContain("0");
  });
});
