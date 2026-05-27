import { describe, expect, it } from "vitest";
import { formatSummaryStat } from "./format.js";

describe("formatSummaryStat", () => {
  it("formats all fields with zero decimals by default", () => {
    const out = formatSummaryStat({
      min: 35000,
      max: 65000,
      mean: 50250.5,
      sd: 4200.3,
      q1: 47000,
      q2: 50000,
      q3: 53000,
    });
    expect(out.value).toBe("50,251");
    expect(out.stats.min).toBe("35,000");
    expect(out.stats.max).toBe("65,000");
    expect(out.stats.std).toBe("4,200");
    expect(out.stats.p25).toBe("47,000");
    expect(out.stats.p50).toBe("50,000");
    expect(out.stats.p75).toBe("53,000");
  });

  it("respects fractionDigits option", () => {
    const out = formatSummaryStat(
      {
        mean: 12.345,
        min: 10.111,
        max: 14.999,
        sd: 1.234,
        q1: 11.4,
        q2: 12.3,
        q3: 13.2,
      },
      { fractionDigits: 2 },
    );
    expect(out.value).toBe("12.35");
    expect(out.stats.min).toBe("10.11");
    expect(out.stats.std).toBe("1.23");
  });

  it("renders dash for undefined stat", () => {
    const out = formatSummaryStat(undefined);
    expect(out.value).toBe("—");
    expect(out.stats.min).toBe("—");
    expect(out.stats.max).toBe("—");
    expect(out.stats.std).toBe("—");
    expect(out.stats.p25).toBe("—");
    expect(out.stats.p50).toBe("—");
    expect(out.stats.p75).toBe("—");
  });

  it("renders dash for individually missing fields", () => {
    const out = formatSummaryStat({ mean: 100, min: 50 });
    expect(out.value).toBe("100");
    expect(out.stats.min).toBe("50");
    expect(out.stats.max).toBe("—");
    expect(out.stats.p25).toBe("—");
  });

  it("renders dash for non-finite numbers", () => {
    const out = formatSummaryStat({ mean: Number.NaN, min: Number.POSITIVE_INFINITY });
    expect(out.value).toBe("—");
    expect(out.stats.min).toBe("—");
  });
});
