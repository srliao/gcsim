import type { Sim } from "@gcsim/types";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { DamageTimeline, transformBuckets } from "./damage-timeline.js";

const mockBuckets: Sim.BucketStats = {
  bucket_size: 60,
  buckets: [
    { min: 0, max: 5000, mean: 2500, sd: 800 },
    { min: 3000, max: 12000, mean: 7500, sd: 1500 },
    { min: 8000, max: 20000, mean: 14000, sd: 2000 },
  ],
};

describe("transformBuckets", () => {
  it("converts buckets to chart data with correct time values", () => {
    const result = transformBuckets(mockBuckets);
    expect(result).toHaveLength(3);
    // time = bucket_index * bucket_size / 60
    expect(result[0].time).toBe(0); // 0 * 60 / 60 = 0
    expect(result[1].time).toBe(1); // 1 * 60 / 60 = 1
    expect(result[2].time).toBe(2); // 2 * 60 / 60 = 2
  });

  it("maps min, max, mean from each bucket", () => {
    const result = transformBuckets(mockBuckets);
    expect(result[0].min).toBe(0);
    expect(result[0].max).toBe(5000);
    expect(result[0].mean).toBe(2500);
    expect(result[1].min).toBe(3000);
    expect(result[1].max).toBe(12000);
    expect(result[1].mean).toBe(7500);
  });

  it("computes sdUpper and sdLower correctly", () => {
    const result = transformBuckets(mockBuckets);
    // sdUpper = mean + sd, sdLower = mean - sd
    expect(result[0].sdUpper).toBe(2500 + 800); // 3300
    expect(result[0].sdLower).toBe(2500 - 800); // 1700
    expect(result[1].sdUpper).toBe(7500 + 1500); // 9000
    expect(result[1].sdLower).toBe(7500 - 1500); // 6000
  });

  it("returns empty array when buckets is undefined", () => {
    const result = transformBuckets({ bucket_size: 60, buckets: undefined });
    expect(result).toHaveLength(0);
  });

  it("returns empty array when buckets array is empty", () => {
    const result = transformBuckets({ bucket_size: 60, buckets: [] });
    expect(result).toHaveLength(0);
  });

  it("handles missing stat fields gracefully (defaults to 0)", () => {
    const result = transformBuckets({
      bucket_size: 60,
      buckets: [{}],
    });
    expect(result[0].min).toBe(0);
    expect(result[0].max).toBe(0);
    expect(result[0].mean).toBe(0);
    expect(result[0].sdUpper).toBe(0);
    expect(result[0].sdLower).toBe(0);
  });

  it("uses bucket_size to compute time correctly with non-60 bucket size", () => {
    const result = transformBuckets({
      bucket_size: 120,
      buckets: [{ mean: 1000 }, { mean: 2000 }],
    });
    expect(result[0].time).toBe(0); // 0 * 120 / 60 = 0
    expect(result[1].time).toBe(2); // 1 * 120 / 60 = 2
  });
});

describe("DamageTimeline", () => {
  it("renders without crashing with valid data", () => {
    const { container } = render(<DamageTimeline buckets={mockBuckets} />);
    expect(container.firstChild).not.toBeNull();
  });

  it("renders the chart wrapper with data-testid", () => {
    render(<DamageTimeline buckets={mockBuckets} />);
    expect(screen.getByTestId("damage-timeline")).toBeInTheDocument();
  });

  it("renders chart title", () => {
    render(<DamageTimeline buckets={mockBuckets} />);
    expect(screen.getByTestId("chart-shell-title")).toHaveTextContent("DPS Timeline");
  });

  it("renders chart body when data is provided", () => {
    render(<DamageTimeline buckets={mockBuckets} />);
    expect(screen.getByTestId("chart-shell-body")).toBeInTheDocument();
  });

  it("renders empty state when buckets is undefined", () => {
    render(<DamageTimeline buckets={undefined} />);
    expect(screen.getByTestId("chart-shell-empty")).toHaveTextContent("No data available");
  });

  it("renders empty state when buckets array is empty", () => {
    render(<DamageTimeline buckets={{ bucket_size: 60, buckets: [] }} />);
    expect(screen.getByTestId("chart-shell-empty")).toHaveTextContent("No data available");
  });
});
